import type { RegionMeta } from "../data/regions";
import { RegionIcon } from "./identity";
import type { RegionSummary } from "../state/regions";
import { STATUS_STYLE } from "./status";

interface Props { meta: RegionMeta; summary: RegionSummary; selected: boolean; onSelect: () => void; onHover: (hovering: boolean) => void; }
export function RegionCard({ meta, summary, selected, onSelect, onHover }: Props) {
  const status = STATUS_STYLE[summary.status];
  return <button type="button" onClick={onSelect} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} onFocus={() => onHover(true)} onBlur={() => onHover(false)} aria-pressed={selected} className={`region-row ${selected ? "is-selected" : ""}`}>
    <RegionIcon id={meta.id} size={34} />
    <span className="region-copy"><strong>{meta.label}</strong><small>{summary.headline}</small></span>
    <span className={`region-status ${summary.statusAvailable === false ? "region-status-unassessed" : `region-status-${summary.status}`}`}>{summary.statusAvailable === false ? "Not assessed" : <><span aria-hidden="true">{status.symbol}</span> {status.word}</>}</span><span className="region-arrow" aria-hidden="true">↗</span>
  </button>;
}
