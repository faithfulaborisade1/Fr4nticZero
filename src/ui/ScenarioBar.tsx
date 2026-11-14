import { SCENARIOS, getScenario } from "../data/scenarios";
import { missionDay, type ClockState } from "../state/clock";
import { SimulatedBadge } from "./Badge";

interface Props {
  scenarioId: string;
  clock: ClockState;
  onScenario: (id: string) => void;
  onTogglePlay: () => void;
  onNextDay: () => void;
  onSpeed: (minPerSec: number) => void;
}

const SPEEDS = [
  { label: "Real time", value: 1 / 60 },
  { label: "1 min / s", value: 1 },
  { label: "10 min / s", value: 10 },
  { label: "1 day / 3 s", value: 480 },
];

export function ScenarioBar({
  scenarioId,
  clock,
  onScenario,
  onTogglePlay,
  onNextDay,
  onSpeed,
}: Props) {
  const scenario = getScenario(scenarioId);
  return (
    <section
      aria-label="Scenario player"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Scenario player
        </h2>
        <SimulatedBadge />
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Scenario</span>
          <select
            className="min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3"
            value={scenarioId}
            onChange={(e) => onScenario(e.target.value)}
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onTogglePlay}
          className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm font-medium hover:bg-slate-800"
        >
          {clock.playing ? "⏸ Pause clock" : "▶ Play clock"}
        </button>
        <button
          type="button"
          onClick={onNextDay}
          className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm font-medium hover:bg-slate-800"
        >
          Next day ⏭
        </button>
        <label className="flex items-center gap-2 text-sm">
          Speed
          <select
            className="min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3"
            value={clock.speed}
            onChange={(e) => onSpeed(Number(e.target.value))}
          >
            {SPEEDS.map((s) => (
              <option key={s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-slate-300">
          Mission day {missionDay(clock) + 1}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{scenario.blurb}</p>
    </section>
  );
}
