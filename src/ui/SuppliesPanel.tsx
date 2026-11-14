import { KIT } from "../data/kit";
import { minutesToday, type Supplies } from "../state/supplies";
import { DemoBadge, SimulatedBadge } from "./Badge";

interface Props {
  supplies: Supplies;
  day: number;
  onEat: (id: string) => void;
}

/** Kit stock, pantry stock and the crew-time tally. Taking a step on a decision card uses these up. */
export function SuppliesPanel({ supplies, day, onEat }: Props) {
  return (
    <section
      aria-label="Supplies and crew time"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Supplies and crew time
        </h2>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <DemoBadge label="Demo quantities" />
        </div>
      </div>
      <p className="mt-2 text-sm">
        Crew time spent on health steps today:{" "}
        <strong>{minutesToday(supplies, day)} min</strong>
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Medical kit</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {KIT.map((k) => {
              const qty = supplies.kit[k.id];
              const low = qty <= k.lowAt;
              return (
                <li key={k.id} className="flex items-center justify-between gap-2">
                  <span>{k.name}</span>
                  <span className={low ? "font-semibold text-amber-300" : ""}>
                    {low && <span aria-hidden="true">▲ </span>}
                    {qty}
                    {low && <span className="ml-1 text-xs">{qty === 0 ? "out" : "low"}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Pantry</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {supplies.pantry.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span>
                  {p.name}{" "}
                  <span className="text-xs text-slate-400">
                    ({p.qty} left, last eaten{" "}
                    {p.daysSinceEaten === 0 ? "today" : `${p.daysSinceEaten} days ago`})
                  </span>
                </span>
                <button
                  type="button"
                  disabled={p.qty === 0}
                  onClick={() => onEat(p.id)}
                  className="min-h-11 shrink-0 rounded-lg border border-slate-500 px-3 text-xs hover:bg-slate-800 disabled:opacity-40"
                >
                  Ate one
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
