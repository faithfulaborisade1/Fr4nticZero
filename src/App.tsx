import { useMemo, useState } from "react";
import { generateHistory } from "./data/generator";
import { REGIONS, getRegionMeta, type RegionId } from "./data/regions";
import { MARS_DELAY_MAX_SEC, makeEnvironment } from "./engine/environments";
import type { Environment } from "./engine/types";
import { buildSummaries } from "./state/regions";
import { BodyScan } from "./ui/BodyScan";
import { CabinStrip } from "./ui/CabinStrip";
import { EnvironmentBar } from "./ui/EnvironmentBar";
import { RegionCard } from "./ui/RegionCard";
import { StatusBadge, SimulatedBadge } from "./ui/Badge";

export default function App() {
  const history = useMemo(() => generateHistory(2026, 30), []);
  const summaries = useMemo(() => buildSummaries(history), [history]);

  const [envId, setEnvId] = useState<Environment["id"]>("station");
  const [delaySec, setDelaySec] = useState(MARS_DELAY_MAX_SEC);
  const [blackout, setBlackout] = useState(false);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);

  const env = makeEnvironment(envId, delaySec, blackout);
  const missionDay = history.bp_systolic.length;

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
        missionDay={missionDay}
        onEnvChange={(id) => {
          setEnvId(id);
          if (id === "moon") setDelaySec(8);
          if (id === "mars") setDelaySec(MARS_DELAY_MAX_SEC);
        }}
        onDelayChange={setDelaySec}
        onBlackoutChange={setBlackout}
      />

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

      <footer className="mt-auto pt-4 text-xs text-slate-400">
        Prototype, not a medical device. All crew data is simulated.
      </footer>
    </div>
  );
}
