import { DEVICES, isDown, type DeviceState } from "../data/devices";
import { DemoBadge, SimulatedBadge } from "./Badge";

interface Props {
  state: DeviceState;
  onToggle: (id: string) => void;
}

/** Equipment status. Mark a device failed to see what the crew loses and the fallback. */
export function EquipmentPanel({ state, onToggle }: Props) {
  const down = DEVICES.filter((d) => isDown(state, d.id));
  return (
    <section
      aria-label="Equipment status"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Equipment status
        </h2>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <DemoBadge label="Demo fallbacks" />
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Equipment can fail a long way from Earth. Mark a device as failed to see which steps it
        blocks and what the crew can do meanwhile.
      </p>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {DEVICES.map((d) => {
          const failed = isDown(state, d.id);
          return (
            <li
              key={d.id}
              className={`rounded-lg border p-3 ${
                failed ? "border-red-400/80 bg-red-400/10" : "border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{d.name}</span>
                <button
                  type="button"
                  aria-pressed={failed}
                  onClick={() => onToggle(d.id)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
                    failed
                      ? "border-red-400 text-red-200 hover:bg-red-400 hover:text-slate-900"
                      : "border-emerald-500/60 text-emerald-300 hover:bg-emerald-500 hover:text-slate-900"
                  }`}
                >
                  {failed ? "⚠ Failed (tap to restore)" : "✓ Working (tap to fail)"}
                </button>
              </div>
              {failed && <p className="mt-2 text-sm">Fallback: {d.fallback}</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-slate-400" role="status">
        {down.length === 0
          ? "All equipment working."
          : `${down.length} device${down.length > 1 ? "s" : ""} down: ${down.map((d) => d.name).join(", ")}.`}
      </p>
    </section>
  );
}
