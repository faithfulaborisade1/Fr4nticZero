import { describeProjection } from "../engine/projection";
import { approaching, type TrendEntry } from "../state/trends";
import { DemoBadge } from "./Badge";

/**
 * On-board trend watch: indicators whose recent trend is heading for their flag level,
 * or already past it. Plain statistics on this device, no cloud and no trained model.
 */
export function TrendWatch({
  trends,
  carded,
}: {
  trends: TrendEntry[];
  /** Indicators that already have a decision card. They are not repeated here. */
  carded: Set<string>;
}) {
  const open = trends.filter((t) => !carded.has(t.indicator));
  const soon = approaching(open, 7);
  const past = open.filter((t) => t.projection.kind === "already");
  const items = [...soon, ...past];

  return (
    <section
      aria-label="On-board trend watch"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          On-board trend watch
        </h2>
        <span className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          Works offline, no Earth link needed <DemoBadge label="Demo parameters" />
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-300">
          No indicator is heading toward its flag level. Projections use the last 7 readings.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {items.map((t) => (
            <li
              key={t.indicator}
              className="rounded-lg border border-amber-400/60 bg-amber-400/10 p-3 text-sm"
            >
              <span aria-hidden="true">⏱ </span>
              <strong>{t.label}:</strong>{" "}
              {describeProjection(t.projection, t.label, t.unit, t.decimals)}{" "}
              <span className="text-slate-300">
                Top up and re-check now. If it keeps heading that way, tell the medical team.
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-400">
        A projection continues a recent trend in a straight line. It is not a prediction or a
        diagnosis, and it can be wrong.
      </p>
    </section>
  );
}
