import {
  GROUND_RESPONSE_MIN,
  earthReplyMin,
} from "../engine/verdict";
import {
  MARS_DELAY_MAX_SEC,
  MOON_DELAY_RANGE_SEC,
} from "../engine/environments";
import type { Environment } from "../engine/types";
import { DemoBadge, SimulatedBadge } from "./Badge";

interface Props {
  env: Environment;
  missionDay: number;
  onEnvChange: (id: Environment["id"]) => void;
  onDelayChange: (sec: number) => void;
  onBlackoutChange: (on: boolean) => void;
}

const ENVS: { id: Environment["id"]; label: string }[] = [
  { id: "station", label: "Station" },
  { id: "moon", label: "Moon surface" },
  { id: "mars", label: "Mars transit" },
];

export function formatDelay(sec: number): string {
  if (sec < 60) return `${Math.round(sec)} s`;
  return `${(sec / 60).toFixed(sec % 60 === 0 ? 0 : 1)} min`;
}

export function EnvironmentBar({
  env,
  missionDay,
  onEnvChange,
  onDelayChange,
  onBlackoutChange,
}: Props) {
  const reply = earthReplyMin(env.oneWayDelaySec);
  return (
    <section
      aria-label="Distance from Earth"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Distance from Earth
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <SimulatedBadge />
          <span>Mission day {missionDay}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Environment">
        {ENVS.map((e) => (
          <button
            key={e.id}
            type="button"
            role="radio"
            aria-checked={env.id === e.id}
            onClick={() => onEnvChange(e.id)}
            className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${
              env.id === e.id
                ? "border-white bg-white text-slate-900"
                : "border-slate-600 hover:bg-slate-800"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {env.id !== "station" && (
        <div className="mt-4">
          <label className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0">One-way delay</span>
            {env.id === "moon" ? (
              <input
                type="range"
                className="h-8 w-full"
                min={MOON_DELAY_RANGE_SEC[0]}
                max={MOON_DELAY_RANGE_SEC[1]}
                step={1}
                value={env.oneWayDelaySec}
                onChange={(e) => onDelayChange(Number(e.target.value))}
              />
            ) : (
              <input
                type="range"
                className="h-8 w-full"
                min={60}
                max={MARS_DELAY_MAX_SEC}
                step={60}
                value={env.oneWayDelaySec}
                onChange={(e) => onDelayChange(Number(e.target.value))}
              />
            )}
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div>
          One-way delay: <strong>{formatDelay(env.oneWayDelaySec)}</strong>
        </div>
        <div>
          Earth reply in about <strong>{reply.toFixed(1)} min</strong>{" "}
          <span className="text-slate-400">
            (round trip + {GROUND_RESPONSE_MIN} min ground response)
          </span>{" "}
          <DemoBadge />
        </div>
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={env.blackout}
            onChange={(e) => onBlackoutChange(e.target.checked)}
          />
          Comms blackout
        </label>
      </div>
    </section>
  );
}
