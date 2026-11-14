import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_WORKING, type DeviceState } from "./data/devices";
import { generateHistory } from "./data/generator";
import { regionInHazard, type HazardFilter } from "./data/hazards";
import { REGIONS, type RegionId } from "./data/regions";
import { DEFAULT_SCENARIO, getScenario } from "./data/scenarios";
import { evaluateCrosslinks } from "./engine/crosslinks";
import { MARS_DELAY_MAX_SEC, makeEnvironment } from "./engine/environments";
import { ALL_CLEAR_TEXT } from "./engine/escalation";
import type { Environment, Step } from "./engine/types";
import { toAttachment, validateImage, type Attachment } from "./state/attachments";
import { buildCards } from "./state/cards";
import {
  createClock,
  jumpToDay,
  missionDay,
  nowISO,
  pause,
  play,
  tick,
} from "./state/clock";
import {
  appendCheckIns,
  readingTimeFor,
  visibleHistory,
  type CheckInEntry,
} from "./state/history";
import {
  addEntry,
  createEntry,
  releaseHeld,
  reviewEntry,
  type LedgerEntry,
} from "./state/ledger";
import { clearSaved, loadSaved, saveState, type SavedState } from "./state/persist";
import { buildSummaries } from "./state/regions";
import { buildTrends } from "./state/trends";
import { eatMeal, initialSupplies, stepKey, takeStep } from "./state/supplies";
import { BodyScan } from "./ui/BodyScan";
import { CabinStrip } from "./ui/CabinStrip";
import type { CheckInValue } from "./ui/CheckIn";
import { CompareChart } from "./ui/CompareChart";
import { DecisionCardView } from "./ui/DecisionCard";
import { EquipmentPanel } from "./ui/EquipmentPanel";
import { EnvironmentBar } from "./ui/EnvironmentBar";
import { HazardTabs } from "./ui/HazardTabs";
import { Ledger } from "./ui/Ledger";
import { RegionCard } from "./ui/RegionCard";
import { RegionDetail } from "./ui/RegionDetail";
import { ScenarioBar } from "./ui/ScenarioBar";
import { SuppliesPanel } from "./ui/SuppliesPanel";
import { TrendWatch } from "./ui/TrendWatch";

const HISTORY_DAYS = 30;
// Start paused, one mission minute per real second.
const INITIAL_CLOCK = jumpToDay(
  createClock(undefined, 1),
  getScenario(DEFAULT_SCENARIO).startDay,
);

// Restore what the crew did before a reload. The clock always comes back paused.
const SAVED = loadSaved();
const START_CLOCK = SAVED
  ? { ...INITIAL_CLOCK, elapsedMin: SAVED.elapsedMin, speed: SAVED.speed }
  : INITIAL_CLOCK;

export default function App() {
  const baseHistory = useMemo(() => generateHistory(2026, HISTORY_DAYS), []);

  const [clock, setClock] = useState(START_CLOCK);
  const [scenarioId, setScenarioId] = useState(SAVED?.scenarioId ?? DEFAULT_SCENARIO);
  const [ledger, setLedger] = useState<LedgerEntry[]>(SAVED?.ledger ?? []);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>(SAVED?.checkIns ?? []);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>(SAVED?.dismissed ?? {});
  const [supplies, setSupplies] = useState(() => SAVED?.supplies ?? initialSupplies());
  const [hazard, setHazard] = useState<HazardFilter>(SAVED?.hazard ?? "all");
  const [devices, setDevices] = useState<DeviceState>(SAVED?.devices ?? ALL_WORKING);
  const [pending, setPending] = useState<Record<string, Attachment[]>>(SAVED?.pending ?? {});

  const [envId, setEnvId] = useState<Environment["id"]>(SAVED?.envId ?? "station");
  const [delaySec, setDelaySec] = useState(SAVED?.delaySec ?? MARS_DELAY_MAX_SEC);
  const [blackout, setBlackout] = useState(SAVED?.blackout ?? false);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setClock((c) => tick(c, 0.25)), 250);
    return () => clearInterval(id);
  }, []);

  // Keep the latest state in a ref and save it every second, and again when the page is
  // hidden or closed. (A debounce would never fire while the mission clock is ticking.)
  const latestRef = useRef<SavedState | null>(null);
  latestRef.current = {
    v: 1,
    scenarioId,
    elapsedMin: clock.elapsedMin,
    speed: clock.speed,
    envId,
    delaySec,
    blackout,
    hazard,
    ledger,
    checkIns,
    dismissed,
    supplies,
    devices,
    pending,
  };
  useEffect(() => {
    const save = () => {
      if (latestRef.current) saveState(latestRef.current);
    };
    const id = setInterval(save, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    // Let the figure zoom in first, then bring the details into view.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () =>
        detailRef.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "nearest",
        }),
      reduce ? 0 : 450,
    );
    return () => clearTimeout(t);
  }, [selected]);

  const day = missionDay(clock);
  const fullHistory = useMemo(
    () => getScenario(scenarioId).apply(baseHistory),
    [baseHistory, scenarioId],
  );
  const visible = useMemo(() => visibleHistory(fullHistory, day), [fullHistory, day]);
  const history = useMemo(() => appendCheckIns(visible, checkIns), [visible, checkIns]);

  const links = useMemo(() => evaluateCrosslinks(history), [history]);
  const summaries = useMemo(() => buildSummaries(history, links), [history, links]);
  const trends = useMemo(() => buildTrends(history), [history]);

  const env = makeEnvironment(envId, delaySec, blackout);
  const entries = useMemo(
    () =>
      buildCards(history, makeEnvironment(envId, delaySec, blackout), (ind) =>
        readingTimeFor(
          ind,
          clock.startISO,
          Math.min(day + 1, fullHistory[ind]?.length ?? 1),
          checkIns,
        ),
      ),
    [history, envId, delaySec, blackout, clock.startISO, day, fullHistory, checkIns],
  );
  const now = nowISO(clock);
  const nudges = links.nudges.filter((n) => !dismissed[n.id]);

  const shownEntries = entries.filter((e) => hazard === "all" || e.rule.hazard === hazard);
  const showCabin = hazard === "all" || hazard === "environment";

  const left = REGIONS.filter((r) => r.side === "left" && regionInHazard(r.id, hazard));
  const right = REGIONS.filter((r) => r.side === "right" && regionInHazard(r.id, hazard));

  const card = (r: (typeof REGIONS)[number]) => (
    <RegionCard
      key={r.id}
      meta={r}
      summary={summaries[r.id]}
      selected={selected === r.id}
      onSelect={() => setSelected(r.id)}
      onHover={(on) => setHovered(on ? r.id : null)}
    />
  );

  function chooseScenario(id: string) {
    setScenarioId(id);
    setClock((c) => pause(jumpToDay(c, getScenario(id).startDay)));
    setLedger([]);
    setCheckIns([]);
    setDismissed({});
    setSupplies(initialSupplies());
    setDevices(ALL_WORKING);
    setPending({});
  }

  /** Back to the opening state of the demo: scenario 1 on Station, nothing logged. */
  function resetDemo() {
    clearSaved();
    chooseScenario(DEFAULT_SCENARIO);
    setEnvId("station");
    setDelaySec(MARS_DELAY_MAX_SEC);
    setBlackout(false);
    setHazard("all");
    setDevices(ALL_WORKING);
    setPending({});
    setSelected(null);
    setClock(INITIAL_CLOCK);
  }

  function takeCardStep(cardId: string, index: number, step: Step) {
    setSupplies((s) => takeStep(s, stepKey(cardId, index), step, day));
  }

  function logChoice(entry: (typeof entries)[number], choice: string) {
    const files = pending[entry.card.id] ?? [];
    setLedger((l) =>
      addEntry(l, createEntry(entry.card, entry.rule, choice, env, nowISO(clock), files)),
    );
    setPending((p) => {
      const { [entry.card.id]: _sent, ...rest } = p;
      void _sent;
      return rest;
    });
    // Start the mission clock so the entry can be seen crossing the link.
    setClock((c) => (c.playing ? c : play(c)));
  }

  function changeBlackout(on: boolean) {
    setBlackout(on);
    if (!on) {
      setLedger((l) => releaseHeld(l, makeEnvironment(envId, delaySec, false), nowISO(clock)));
    }
  }

  function surgeonReview(id: string, review: "concur" | "overrule") {
    setLedger((l) => reviewEntry(l, id, review, env, nowISO(clock)));
  }

  /** Returns an error message, or null if the file was attached. */
  async function attachImage(
    cardId: string,
    file: File,
    source: Attachment["source"],
  ): Promise<string | null> {
    const error = validateImage(file, pending[cardId]?.length ?? 0);
    if (error) return error;
    const att = await toAttachment(file, source);
    setPending((p) => ({ ...p, [cardId]: [...(p[cardId] ?? []), att] }));
    return null;
  }

  function removeImage(cardId: string, index: number) {
    setPending((p) => ({ ...p, [cardId]: (p[cardId] ?? []).filter((_, i) => i !== index) }));
  }

  function logCheckIn(values: CheckInValue[]) {
    const atISO = nowISO(clock);
    setCheckIns((p) => [...p, ...values.map((v) => ({ ...v, atISO }))]);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold">Decision Window</h1>
        <p className="text-sm text-slate-300">
          The same reading means “ask Houston” in orbit and “your call” on the way to Mars.
        </p>
      </header>

      <EnvironmentBar
        env={env}
        missionDay={day + 1}
        onEnvChange={(id) => {
          setEnvId(id);
          if (id === "moon") setDelaySec(8);
          if (id === "mars") setDelaySec(MARS_DELAY_MAX_SEC);
        }}
        onDelayChange={setDelaySec}
        onBlackoutChange={changeBlackout}
      />

      <section aria-label="Decision cards" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Whose call is this, and by when?
        </h2>
        {shownEntries.length === 0 ? (
          <p className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm">
            ✓ {entries.length === 0 ? ALL_CLEAR_TEXT : "No flagged readings for this hazard."}
          </p>
        ) : (
          shownEntries.map((e) => (
            <DecisionCardView
              key={e.card.id}
              entry={e}
              clock={clock}
              nowISO={now}
              day={day}
              blackout={blackout}
              supplies={supplies}
              devices={devices}
              attachments={pending[e.card.id] ?? []}
              choice={ledger.find((l) => l.id === e.card.id)?.crewChoice}
              onChoose={(c) => logChoice(e, c)}
              onTakeStep={(i, step) => takeCardStep(e.card.id, i, step)}
              onAttach={(file, source) => attachImage(e.card.id, file, source)}
              onRemoveAttachment={(i) => removeImage(e.card.id, i)}
            />
          ))
        )}
        {nudges.map((n) => (
          <div
            key={n.id}
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-400/60 bg-sky-400/10 p-3 text-sm"
          >
            <span>💬 {n.text}</span>
            <button
              type="button"
              onClick={() => setDismissed((p) => ({ ...p, [n.id]: true }))}
              className="min-h-11 rounded-lg border border-slate-500 px-3 hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ))}
      </section>

      <TrendWatch trends={trends} carded={new Set(entries.map((e) => e.rule.indicator))} />

      <Ledger entries={ledger} clock={clock} nowISO={now} onReview={surgeonReview} />

      <HazardTabs value={hazard} onChange={setHazard} />

      <main className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12">
        <div className="order-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
          {left.map(card)}
        </div>
        <div className="order-1 lg:order-2">
          <BodyScan
            summaries={summaries}
            selected={selected}
            highlighted={hovered}
            filter={hazard}
            onSelect={setSelected}
          />
        </div>
        <div className="order-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {right.map(card)}
        </div>
      </main>

      <div ref={detailRef}>
        {selected && (
          <RegionDetail
            regionId={selected}
            summary={summaries[selected]}
            history={history}
            links={links}
            pantry={supplies.pantry}
            devices={devices}
            dismissedNudges={dismissed}
            onDismissNudge={(id) => setDismissed((p) => ({ ...p, [id]: true }))}
            onCheckIn={logCheckIn}
            onEat={(id) => setSupplies((s) => eatMeal(s, id))}
          />
        )}
      </div>

      {showCabin && <CabinStrip
          co2MmHg={history.co2[history.co2.length - 1]}
          co2SensorDown={devices.co2_sensor === false}
        />}

      <CompareChart history={history} />

      <EquipmentPanel
        state={devices}
        onToggle={(id) => setDevices((d) => ({ ...d, [id]: d[id] === false }))}
      />

      <SuppliesPanel
        supplies={supplies}
        day={day}
        onEat={(id) => setSupplies((s) => eatMeal(s, id))}
      />

      <ScenarioBar
        scenarioId={scenarioId}
        clock={clock}
        onScenario={chooseScenario}
        onTogglePlay={() => setClock((c) => (c.playing ? pause(c) : play(c)))}
        onNextDay={() => setClock((c) => jumpToDay(c, missionDay(c) + 1))}
        onSpeed={(s) => setClock((c) => ({ ...c, speed: s }))}
        onReset={resetDemo}
      />

      <footer className="mt-auto pt-4 text-xs text-slate-400">
        Prototype, not a medical device. All crew data is simulated.
      </footer>
    </div>
  );
}
