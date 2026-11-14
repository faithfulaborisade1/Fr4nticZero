import { HAZARDS, getHazard, type HazardFilter } from "../data/hazards";
import { DemoBadge } from "./Badge";

interface Props {
  value: HazardFilter;
  onChange: (v: HazardFilter) => void;
}

const TABS: { id: HazardFilter; label: string }[] = [
  { id: "all", label: "All hazards" },
  ...HAZARDS.map((h) => ({ id: h.id as HazardFilter, label: h.label })),
];

/** Explore hazard context and select the shared body and decision filter. */
export function HazardTabs({ value, onChange }: Props) {
  const info = value === "all" ? null : getHazard(value);
  return (
    <section
      aria-label="Hazard filter"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        Spaceflight hazards
      </h2>
      <div role="tablist" aria-label="Hazard" className="mt-2 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${
              value === t.id
                ? "border-white bg-white text-slate-900"
                : "border-slate-600 hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {info ? (
        <div role="tabpanel" className="mt-3 text-sm">
          <p>{info.blurb}</p>
          <p className="mt-1">
            <strong>Published figure:</strong> {info.figure}
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
            {info.sources.map((s) => (
              <li key={s.url}>
                Source:{" "}
                <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
          Pick a hazard to explore its effects and filter the body scan and decisions.
          Health flags compare you with your own baseline using demo thresholds <DemoBadge />
        </p>
      )}
    </section>
  );
}
