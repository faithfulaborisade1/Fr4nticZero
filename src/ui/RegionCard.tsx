import type { RegionMeta } from "../data/regions";
import type { RegionSummary } from "../state/regions";
import { StatusBadge } from "./Badge";
import { STATUS_STYLE } from "./status";

interface Props {
  meta: RegionMeta;
  summary: RegionSummary;
  selected: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}

export function RegionCard({ meta, summary, selected, onSelect, onHover }: Props) {
  const s = STATUS_STYLE[summary.status];
  const line =
    meta.side === "left"
      ? "lg:after:-right-6"
      : "lg:after:-left-6";
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-pressed={selected}
      className={`relative min-h-16 w-full rounded-lg border-l-4 border-y border-r p-3 text-left transition
        ${s.border} ${s.bg} ${selected ? "ring-2 ring-white" : "hover:brightness-125"}
        lg:after:absolute lg:after:top-1/2 lg:after:h-px lg:after:w-6 lg:after:bg-slate-600 lg:after:content-[''] ${line}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">
          <span aria-hidden="true" className="mr-1">
            {meta.icon}
          </span>
          {meta.label}
        </span>
        <StatusBadge status={summary.status} />
      </div>
      <div className="mt-1 text-sm">{summary.headline}</div>
      {summary.detail && (
        <div className="text-xs text-slate-400">{summary.detail}</div>
      )}
    </button>
  );
}
