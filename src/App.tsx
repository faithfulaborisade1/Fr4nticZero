import { useEffect, useMemo, useState } from "react";
import { generateHistory } from "./data/generator";
import { REGIONS, getRegionMeta, type RegionId } from "./data/regions";
import { DEFAULT_SCENARIO, getScenario } from "./data/scenarios";
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
import { buildSummaries } from "./state/regions";
import { SimulatedBadge, StatusBadge } from "./ui/Badge";
import { BodyScan } from "./ui/BodyScan";
import { CabinStrip } from "./ui/CabinStrip";
import { DecisionCardView } from "./ui/DecisionCard";
import { EnvironmentBar } from "./ui/EnvironmentBar";
import { RegionCard } from "./ui/RegionCard";
import { ScenarioBar } from "./ui/ScenarioBar";

const HISTORY_DAYS = 30;
// Start on mission day 30, paused, one mission minute per real second.
const INITIAL_CLOCK = jumpToDay(createClock(undefined, 1), HISTORY_DAYS - 1);

export default function App() {
  const baseHistory = useMemo(() => generateHistory(2026, HISTORY_DAYS), []);

  const [clock, setClock] = useState(INITIAL_CLOCK);
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [readingISO, setReadingISO] = useState(() => nowISO(INITIAL_CLOCK));
  const [choices, setChoices] = useState<Record<string, string>>({});

  const [envId, setEnvId] = useState<Environment["id"]>("station");
  const [delaySec, setDelaySec] = useState(MARS_DELAY_MAX_SEC);
  const [blackout, setBlackout] = useState(false);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);

  useEffect(() => {
    const id = setInterval(() => setClock((c) => tick(c, 0.25)), 250);
    return () => clearInterval(id);
  }, []);

  const history = useMemo(
    () => getScenario(scenarioId).apply(baseHistory),
    [baseHistory, scenarioId],
  );
  const summaries = useMemo(() => buildSummaries(history), [history]);

  const env = makeEnvironment(envId, delaySec, blackout);
  const entries = useMemo(
    () => buildCards(history, env, readingISO),
    // env is rebuilt each render from primitives; depend on those.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, envId, delaySec, blackout, readingISO],
  );
  const now = nowISO(clock);

  const left = REGIONS.filter((r) => r.side === "left");
  const right = REGIONS.filter((r) => r.side === "right");
  const sel = selected ? getRegionMeta(selected) : null;

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
        missionDay={missionDay(clock) + 1}
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

      {sel && selected && (
        <section
          aria-label={`${sel.label} details`}
          className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {sel.icon} {sel.label}
            </h2>
            <StatusBadge status={summaries[selected].status} />
            <span className="rounded border border-slate-500 px-1.5 py-0.5 text-xs capitalize">
              Hazard: {sel.hazard}
            </span>
            <SimulatedBadge />
          </div>
          <p className="mt-2 text-sm">{sel.explanation}</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-300">Measured on board</dt>
              <dd>{sel.measuredInSpace}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-300">Needs Earth</dt>
              <dd>{sel.needsEarth}</dd>
            </div>
          </dl>
        </section>
      )}

      <CabinStrip />

      <ScenarioBar
        scenarioId={scenarioId}
        clock={clock}
        onScenario={(id) => {
          setScenarioId(id);
          setReadingISO(nowISO(clock));
          setChoices({});
        }}
        onTogglePlay={() => setClock((c) => (c.playing ? pause(c) : play(c)))}
        onSpeed={(s) => setClock((c) => ({ ...c, speed: s }))}
      />

      <footer className="mt-auto pt-4 text-xs text-slate-400">
        Prototype, not a medical device. All crew data is simulated.
      </footer>
    </div>
  );
}
