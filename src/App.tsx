import { useEffect, useMemo, useRef, useState } from "react";
import { generateHistory } from "./data/generator";
import { REGIONS, type RegionId } from "./data/regions";
import { DEFAULT_SCENARIO, getScenario } from "./data/scenarios";
import { evaluateCrosslinks } from "./engine/crosslinks";
import { MARS_DELAY_MAX_SEC, makeEnvironment } from "./engine/environments";
import type { Environment } from "./engine/types";
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
import { buildSummaries } from "./state/regions";
import { BodyScan } from "./ui/BodyScan";
import { CabinStrip } from "./ui/CabinStrip";
import type { CheckInValue } from "./ui/CheckIn";
import { DecisionCardView } from "./ui/DecisionCard";
import { EnvironmentBar } from "./ui/EnvironmentBar";
import { RegionCard } from "./ui/RegionCard";
import { RegionDetail } from "./ui/RegionDetail";
import { ScenarioBar } from "./ui/ScenarioBar";

const HISTORY_DAYS = 30;
// Start paused, one mission minute per real second.
const INITIAL_CLOCK = jumpToDay(
  createClock(undefined, 1),
  getScenario(DEFAULT_SCENARIO).startDay,
);

export default function App() {
  const baseHistory = useMemo(() => generateHistory(2026, HISTORY_DAYS), []);

  const [clock, setClock] = useState(INITIAL_CLOCK);
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const [envId, setEnvId] = useState<Environment["id"]>("station");
  const [delaySec, setDelaySec] = useState(MARS_DELAY_MAX_SEC);
  const [blackout, setBlackout] = useState(false);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setClock((c) => tick(c, 0.25)), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selected) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  const left = REGIONS.filter((r) => r.side === "left");
  const right = REGIONS.filter((r) => r.side === "right");

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
    setChoices({});
    setCheckIns([]);
    setDismissed({});
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
        onBlackoutChange={setBlackout}
      />

      <section aria-label="Decision cards" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Whose call is this, and by when?
        </h2>
        {entries.length === 0 ? (
          <p className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm">
            ✓ No flagged readings. Everything is near your own baseline.
          </p>
        ) : (
          entries.map((e) => (
            <DecisionCardView
              key={e.card.id}
              entry={e}
              clock={clock}
              nowISO={now}
              blackout={blackout}
              choice={choices[e.card.id]}
              onChoose={(c) => setChoices((p) => ({ ...p, [e.card.id]: c }))}
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

      <main className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12">
        <div className="order-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
          {left.map(card)}
        </div>
        <div className="order-1 lg:order-2">
          <BodyScan
            summaries={summaries}
            selected={selected}
            highlighted={hovered}
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
            nudges={links.nudges}
            dismissedNudges={dismissed}
            onDismissNudge={(id) => setDismissed((p) => ({ ...p, [id]: true }))}
            onCheckIn={logCheckIn}
          />
        )}
      </div>

      <CabinStrip />

      <ScenarioBar
        scenarioId={scenarioId}
        clock={clock}
        onScenario={chooseScenario}
        onTogglePlay={() => setClock((c) => (c.playing ? pause(c) : play(c)))}
        onNextDay={() => setClock((c) => jumpToDay(c, missionDay(c) + 1))}
        onSpeed={(s) => setClock((c) => ({ ...c, speed: s }))}
      />

      <footer className="mt-auto pt-4 text-xs text-slate-400">
        Prototype, not a medical device. All crew data is simulated.
      </footer>
    </div>
  );
}
