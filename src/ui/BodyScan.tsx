import type { KeyboardEvent, ReactNode } from "react";
import { getRegionMeta, type RegionId } from "../data/regions";
import type { Status } from "../engine/types";
import type { RegionSummary } from "../state/regions";
import { STATUS_STYLE } from "./status";

interface Props {
  summaries: Record<RegionId, RegionSummary>;
  selected: RegionId | null;
  highlighted: RegionId | null;
  onSelect: (id: RegionId) => void;
}

/** Original flat astronaut figure. Each clickable shape is a body region. */
export function BodyScan({ summaries, selected, highlighted, onSelect }: Props) {
  const outline = STATUS_STYLE[summaries.radiation.status].hex;

  function region(id: RegionId, shape: (p: ShapeProps) => ReactNode) {
    const status: Status = summaries[id].status;
    const hex = STATUS_STYLE[status].hex;
    const active = selected === id || highlighted === id;
    const label = `${getRegionMeta(id).label}: ${STATUS_STYLE[status].word}. ${summaries[id].headline}`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    };
    return (
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => onSelect(id)}
        onKeyDown={onKey}
        className="cursor-pointer outline-none focus-visible:[&>*]:stroke-white"
      >
        {shape({
          fill: hex,
          fillOpacity: active ? 0.85 : 0.45,
          stroke: active ? "#ffffff" : hex,
          strokeWidth: active ? 3 : 1.5,
        })}
      </g>
    );
  }

  return (
    <svg
      viewBox="0 0 240 480"
      className="mx-auto h-auto w-full max-w-[300px]"
      role="group"
      aria-label="Astronaut body scan. Whole-figure outline shows radiation dose status."
    >
      {/* Backpack */}
      <rect x="86" y="118" width="68" height="120" rx="14" fill="#1e293b" stroke={outline} strokeWidth="3" />
      {/* Arms */}
      <rect x="36" y="128" width="30" height="112" rx="15" fill="#334155" stroke={outline} strokeWidth="3" />
      <rect x="174" y="128" width="30" height="112" rx="15" fill="#334155" stroke={outline} strokeWidth="3" />
      {/* Hands */}
      <circle cx="51" cy="248" r="11" fill="#475569" stroke={outline} strokeWidth="3" />
      <circle cx="189" cy="248" r="11" fill="#475569" stroke={outline} strokeWidth="3" />
      {/* Boots */}
      <rect x="72" y="418" width="48" height="26" rx="10" fill="#475569" stroke={outline} strokeWidth="3" />
      <rect x="120" y="418" width="48" height="26" rx="10" fill="#475569" stroke={outline} strokeWidth="3" />

      {/* Legs: bones and muscles */}
      {region("bones", (p) => (
        <>
          <rect x="74" y="236" width="44" height="186" rx="20" {...p} />
          <rect x="122" y="236" width="44" height="186" rx="20" {...p} />
        </>
      ))}

      {/* Torso: skin / core */}
      {region("skin", (p) => (
        <rect x="64" y="112" width="112" height="140" rx="30" {...p} />
      ))}

      {/* Head (mind): helmet shell */}
      {region("head", (p) => (
        <circle cx="120" cy="62" r="50" {...p} />
      ))}
      {/* Inner ear: side of helmet */}
      {region("ear", (p) => (
        <ellipse cx="76" cy="66" rx="9" ry="14" {...p} />
      ))}
      {/* Eyes: visor */}
      {region("eyes", (p) => (
        <rect x="92" y="48" width="64" height="30" rx="14" {...p} />
      ))}

      {/* Heart */}
      {region("heart", (p) => (
        <circle cx="140" cy="152" r="17" {...p} />
      ))}
      {/* Immune (blood) */}
      {region("immune", (p) => (
        <path d="M100 138 C 90 154, 86 162, 100 172 C 114 162, 110 154, 100 138 Z" {...p} />
      ))}
      {/* Stomach */}
      {region("stomach", (p) => (
        <ellipse cx="120" cy="206" rx="28" ry="22" {...p} />
      ))}

      {/* Region labels inside the figure for quick reading */}
      <g fontSize="9" fill="#e8ecf5" textAnchor="middle" pointerEvents="none">
        <text x="120" y="66">Eyes</text>
        <text x="120" y="209">Stomach</text>
      </g>
    </svg>
  );
}

interface ShapeProps {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
}
