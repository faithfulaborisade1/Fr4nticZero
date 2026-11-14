import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { regionInHazard, type HazardFilter } from "../data/hazards";
import { getRegionMeta, type RegionId } from "../data/regions";
import type { RegionSummary } from "../state/regions";
import { STATUS_STYLE } from "./status";

interface Props {
  model: "male" | "female";
  summaries: Record<RegionId, RegionSummary>;
  selected: RegionId | null;
  highlighted: RegionId | null;
  filter: HazardFilter;
  onSelect: (id: RegionId) => void;
}

// Positions are relative to the full figure. The adjacent body-system list offers
// a second, labelled way to select every region, including radiation.
const POINTS: { id: RegionId; x: number; y: number }[] = [
  { id: "head", x: 50, y: 4 },
  { id: "eyes", x: 62, y: 10 },
  { id: "ear", x: 38, y: 10 },
  { id: "heart", x: 57, y: 25 },
  { id: "immune", x: 43, y: 30 },
  { id: "stomach", x: 51, y: 40 },
  { id: "skin", x: 72, y: 45 },
  { id: "bones", x: 46, y: 69 },
  { id: "radiation", x: 70, y: 19 },
];

export function BodyScan({ model, summaries, selected, highlighted, filter, onSelect }: Props) {
  const [zoomedOut, setZoomedOut] = useState(false);
  const [aiTipOpen, setAiTipOpen] = useState(false);
  useEffect(() => setZoomedOut(false), [selected]);
  const focus = POINTS.find((point) => point.id === selected);
  const zoomed = !!focus && !zoomedOut;
  return <div className="body-model" aria-label="Interactive body scan">
    <div className={`body-model-inner ${zoomed ? "is-zoomed" : ""}`} style={{ transformOrigin: focus ? `${focus.x}% ${focus.y}%` : "center" }}>
    <img className="body-model-image" src={model === "male" ? "/body-model.png" : "/body-model-female.png"} alt={`Illustrative front view of a ${model} human body`} />
    {POINTS.map(({ id, x, y }) => {
      const status = summaries[id].status;
      const active = selected === id || highlighted === id;
      return <button key={id} type="button" className={`body-point body-point-${summaries[id].statusAvailable === false ? "unassessed" : status} ${active ? "is-active" : ""}`} style={{ left: `${x}%`, top: `${y}%`, opacity: regionInHazard(id, filter) ? 1 : 0.25 }} aria-label={`${getRegionMeta(id).label}: ${summaries[id].statusAvailable === false ? "Not assessed" : STATUS_STYLE[status].word}. ${summaries[id].headline}`} aria-pressed={selected === id} onClick={() => onSelect(id)}><span /></button>;
    })}
    </div>
    <span className={`body-ai ${aiTipOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="body-ai-btn"
        aria-label="About this image"
        aria-describedby="body-ai-tip"
        aria-expanded={aiTipOpen}
        onClick={() => setAiTipOpen((v) => !v)}
        onBlur={() => setAiTipOpen(false)}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span role="tooltip" id="body-ai-tip" className="body-ai-tip">
        AI-generated illustration, not a medical image. Markers show simulated readings.
      </span>
    </span>
    {selected && <button type="button" className="zoom-control" onClick={() => setZoomedOut((value) => !value)}>{zoomedOut ? `Zoom in on ${getRegionMeta(selected).label}` : "Show whole body"}</button>}
  </div>;
}
