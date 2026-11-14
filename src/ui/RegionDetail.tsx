import type { History } from "../data/generator";
import {
  INDICATOR_META,
  REGION_INDICATORS,
  SLEEP_SOURCE,
} from "../data/indicators";
import { getRegionMeta, type RegionId } from "../data/regions";
import type { Nudge } from "../engine/crosslinks";
import { indicatorStatus, type RegionSummary } from "../state/regions";
import { DemoBadge, SimulatedBadge, StatusBadge } from "./Badge";
import { CheckIn, type CheckInField, type CheckInValue } from "./CheckIn";
import { STATUS_STYLE } from "./status";
import { TrendChart, type RefLine } from "./TrendChart";

const FORMS: Partial<Record<RegionId, { title: string; fields: CheckInField[] }>> = {
  heart: {
    title: "Heart check-in (daily)",
    fields: [
      { indicator: "bp_systolic", kind: "number" },
      { indicator: "hr", kind: "number" },
      { indicator: "glucose", kind: "number" },
    ],
  },
  head: {
    title: "Daily mind check-in",
    fields: [
      { indicator: "mood", kind: "scale", hint: "1 = low, 5 = great" },
      { indicator: "sleep", kind: "number" },
      { indicator: "stress", kind: "scale", hint: "1 = calm, 5 = very stressed" },
    ],
  },
  skin: {
    title: "Body temperature (daily)",
    fields: [{ indicator: "temp", kind: "number" }],
  },
};

const REF_LINES: Record<string, RefLine[]> = {
  sleep: [
    { y: 8.5, label: "Scheduled 8.5 h" },
    { y: 6, label: "Typical on ISS: about 6 h" },
  ],
};

interface Props {
  regionId: RegionId;
  summary: RegionSummary;
  history: History;
  nudges: Nudge[];
  dismissedNudges: Record<string, boolean>;
  onDismissNudge: (id: string) => void;
  onCheckIn: (values: CheckInValue[]) => void;
}

export function RegionDetail({
  regionId,
  summary,
  history,
  nudges,
  dismissedNudges,
  onDismissNudge,
  onCheckIn,
}: Props) {
  const meta = getRegionMeta(regionId);
  const indicators = REGION_INDICATORS[regionId] ?? [];
  const form = FORMS[regionId];
  const regionNudges = regionId === "head" ? nudges.filter((n) => !dismissedNudges[n.id]) : [];

  return (
    <section
      aria-label={`${meta.label} details`}
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">
          {meta.icon} {meta.label}
        </h2>
        <StatusBadge status={summary.status} />
        <span className="rounded border border-slate-500 px-1.5 py-0.5 text-xs capitalize">
          Hazard: {meta.hazard}
        </span>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm">{meta.explanation}</p>

      {summary.note && (
        <p className="mt-2 rounded-lg border border-amber-400/60 bg-amber-400/10 p-2 text-sm">
          ▲ {summary.note}
        </p>
      )}

      {regionNudges.map((n) => (
        <div
          key={n.id}
          className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-400/60 bg-sky-400/10 p-2 text-sm"
        >
          <span>💬 {n.text}</span>
          <button
            type="button"
            onClick={() => onDismissNudge(n.id)}
            className="min-h-11 rounded-lg border border-slate-500 px-3 hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      ))}

      {indicators.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {indicators.map((id) => {
            const m = INDICATOR_META[id];
            const values = history[id] ?? [];
            if (values.length < 2) return null;
            const status = indicatorStatus(history, id);
            const last = values[values.length - 1];
            return (
              <div key={id} className="rounded-lg border border-slate-700 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{m.label}</h3>
                  <span className="text-sm">
                    <strong>{last.toFixed(m.decimals)}</strong> {m.unit}{" "}
                    <StatusBadge status={status} />
                  </span>
                </div>
                <TrendChart
                  label={m.label}
                  unit={m.unit}
                  values={values}
                  decimals={m.decimals}
                  statusHex={STATUS_STYLE[status].hex}
                  refLines={REF_LINES[id]}
                />
                {id === "sleep" && (
                  <p className="mt-1 text-xs text-slate-400">
                    Source:{" "}
                    <a className="underline" href={SLEEP_SOURCE.url} target="_blank" rel="noreferrer">
                      {SLEEP_SOURCE.title}
                    </a>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <div className="mt-4">
          <CheckIn title={form.title} fields={form.fields} onSubmit={onCheckIn} />
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-700 p-3">
        <h3 className="text-sm font-semibold">How this is measured</h3>
        <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-300">On board</dt>
            <dd>{meta.measuredInSpace}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-300">Needs Earth</dt>
            <dd>{meta.needsEarth}</dd>
          </div>
        </dl>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          Thresholds: <DemoBadge />
        </div>
      </div>
    </section>
  );
}
