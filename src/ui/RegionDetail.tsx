import { DEVICES, deviceIssue, failedDeviceFor, isDown, type DeviceState } from "../data/devices";
import { IndicatorIcon, RegionIcon } from "./identity";
import type { Environment } from "../engine/types";
import type { History } from "../data/generator";
import {
  INDICATOR_META,
  REGION_INDICATORS,
  SANS_SOURCE,
  SLEEP_SOURCE,
} from "../data/indicators";
import { REGION_HAZARDS } from "../data/hazards";
import { suggestMeals, type PantryItem } from "../data/pantry";
import { getRegionMeta, type RegionId } from "../data/regions";
import { B_VITAMIN_NOTE, type Crosslinks } from "../engine/crosslinks";
import { describeProjection } from "../engine/projection";
import { rulesForIndicator } from "../engine/rules";
import { buildTrends } from "../state/trends";
import {
  cumulativeDoseMsv,
  indicatorStatus,
  latest,
  type RegionSummary,
} from "../state/regions";
import { DemoBadge, SimulatedBadge, StatusBadge } from "./Badge";
import { CheckIn, type CheckInField, type CheckInValue } from "./CheckIn";
import { MealSurvey } from "./MealSurvey";
import { NutritionLog } from "./NutritionLog";
import { RadiationGauge } from "./RadiationGauge";
import { STATUS_STYLE } from "./status";
import { TrendChart, type RefLine } from "./TrendChart";
import { BonesAndMuscles } from "./BonesAndMuscles";
import type { WorkoutEntry } from "../state/crew";
import type { ClockState } from "../state/clock";

const FORMS: Partial<
  Record<
    RegionId,
    {
      title: string;
      fields: CheckInField[];
      /** Turn the entered values into the readings to store. */
      compose?: (values: CheckInValue[]) => CheckInValue[];
    }
  >
> = {
  eyes: {
    title: "Vision check (weekly, or when something changes)",
    fields: [
      { indicator: "eyes_vision", kind: "scale", hint: "0 none, 1 slight, 2 noticeable, 3 marked" },
      { indicator: "eyes_headache", kind: "scale", hint: "0 none, 3 most days" },
      { indicator: "eyes_fullness", kind: "scale", hint: "0 none, 3 strong pressure" },
    ],
    compose: (values) => [
      { indicator: "eyes_score", value: values.reduce((a, v) => a + v.value, 0) },
    ],
  },
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
  co2: [
    { y: 2.3, label: "Symptoms reported from 2.3" },
    { y: 3.0, label: "Headaches above about 3.0" },
  ],
  sleep: [
    { y: 8.5, label: "Scheduled 8.5 h" },
    { y: 6, label: "Typical on ISS: about 6 h" },
  ],
};

interface Props {
  regionId: RegionId;
  summary: RegionSummary;
  history: History;
  links: Crosslinks;
  pantry: PantryItem[];
  devices: DeviceState;
  envId?: Environment["id"];
  dismissedNudges: Record<string, boolean>;
  onDismissNudge: (id: string) => void;
  onCheckIn: (values: CheckInValue[]) => void;
  onEat: (id: string) => void;
  crewName: string;
  workouts: WorkoutEntry[];
  clock: ClockState;
  onAddWorkout: (activity: string, minutes: number) => void;
  onRemoveWorkout: (id: string) => void;
}

export function RegionDetail({
  regionId,
  summary,
  history,
  links,
  pantry,
  devices,
  envId,
  dismissedNudges,
  onDismissNudge,
  onCheckIn,
  onEat,
  crewName,
  workouts,
  clock,
  onAddWorkout,
  onRemoveWorkout,
}: Props) {
  const meta = getRegionMeta(regionId);
  const indicators = REGION_INDICATORS[regionId] ?? [];
  const form = FORMS[regionId];
  const trends = buildTrends(history);

  // Devices that have failed and feed this region, and the entry fields they block.
  const feeding = new Set([...indicators, ...(form?.fields.map((f) => f.indicator) ?? [])]);
  const downDevices = DEVICES.filter(
    (d) => isDown(devices, d.id) && d.indicators.some((i) => feeding.has(i)),
  );
  const blocked: Record<string, string> = {};
  for (const f of form?.fields ?? []) {
    const d = failedDeviceFor(devices, f.indicator);
    if (d) blocked[f.indicator] = `${deviceIssue(d, envId).title}. Use the fallback above.`;
  }
  const regionNudges =
    regionId === "head" ? links.nudges.filter((n) => !dismissedNudges[n.id]) : [];
  const suggestions = regionId === "stomach" && links.menuFatigue ? suggestMeals(pantry) : [];
  const showBVitamin = regionId === "eyes" && summary.status !== "ok" && links.bBelowPlan;

  return (
    <section
      aria-label={`${meta.label} details`}
      className="region-detail rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="dw-id-title text-lg font-semibold">
          <RegionIcon id={regionId} size={34} /> {meta.label}
        </h2>
        {summary.statusAvailable === false ? <span className="bones-unassessed">Not assessed</span> : <StatusBadge status={summary.status} />}
        <span className="rounded border border-slate-500 px-1.5 py-0.5 text-xs capitalize">
          Hazard: {REGION_HAZARDS[regionId].join(", ")}
        </span>
        <SimulatedBadge />
      </div>
      <p className="mt-2 text-sm">{meta.explanation}</p>
      <div className="region-about">
        <div>
          <h3>What it does</h3>
          <p>{meta.bodyFunction}</p>
        </div>
        <div>
          <h3>Why we check it in space</h3>
          <p>{meta.whyCheck}</p>
        </div>
      </div>
      {regionId === "bones" && <BonesAndMuscles key={crewName} name={crewName} workouts={workouts} clock={clock} onAdd={onAddWorkout} onRemove={onRemoveWorkout} />}

      {summary.note && (
        <p className="mt-2 rounded-lg border border-amber-400/60 bg-amber-400/10 p-2 text-sm">
          ▲ {summary.note}
        </p>
      )}

      {downDevices.map((d) => (
        <p
          key={d.id}
          role="alert"
          className="mt-2 rounded-lg border border-red-400/80 bg-red-400/10 p-2 text-sm"
        >
          ⚠ <strong>{deviceIssue(d, envId).title}.</strong> Readings below may be out of date. Fallback:{" "}
          {deviceIssue(d, envId).fallback}
        </p>
      ))}

      {regionId === "eyes" && (
        <p className="mt-2 text-xs text-slate-400">
          About 70% of long-duration crew show signs of vision change. Source:{" "}
          <a className="underline" href={SANS_SOURCE.url} target="_blank" rel="noreferrer">
            {SANS_SOURCE.title}
          </a>
        </p>
      )}

      {regionId === "eyes" && (
        <p className="mt-2 text-sm">
          B-vitamin intake today:{" "}
          <strong>{latest(history, "b_vitamin_count")} of 4</strong>{" "}
          <span className="text-slate-400">(logged beside your vision checks)</span>
        </p>
      )}
      {showBVitamin && (
        <p className="mt-2 rounded-lg border border-amber-400/60 bg-amber-400/10 p-2 text-sm">
          ▲ {B_VITAMIN_NOTE}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-2 rounded-lg border border-sky-400/60 bg-sky-400/10 p-2 text-sm">
          🍽 Try something you have not eaten recently from the pantry:
          <ul className="mt-1 list-disc pl-5">
            {suggestions.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-3">
                <span>
                  {p.name}{" "}
                  <span className="text-slate-400">
                    ({p.qty} left, last eaten {p.daysSinceEaten} days ago)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onEat(p.id)}
                  className="min-h-11 rounded-lg border border-slate-400 px-3 text-xs hover:bg-white hover:text-slate-900"
                >
                  Ate one
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {regionId === "radiation" && (
        <div className="mt-4">
          <RadiationGauge
            cumulativeMsv={cumulativeDoseMsv(history)}
            dailyMsv={latest(history, "dose_daily")}
            status={summary.status}
          />
        </div>
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
            const hasRule = rulesForIndicator(id).length > 0;
            const status = indicatorStatus(history, id);
            const last = values[values.length - 1];
            const projection = trends.find((t) => t.indicator === id)?.projection;
            const flagLine: RefLine[] =
              projection && projection.kind !== "insufficient"
                ? [{ y: projection.level, label: "Flag level (demo)", position: "insideBottomRight" }]
                : [];
            return (
              <div key={id} className="rounded-lg border border-slate-700 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="dw-id-title text-sm font-semibold"><IndicatorIcon id={id} size={28} />{m.label}</h3>
                  <span className="text-sm">
                    <strong>{last.toFixed(m.decimals)}</strong> {m.unit}{" "}
                    {hasRule && <StatusBadge status={status} />}
                  </span>
                </div>
                <TrendChart
                  label={m.label}
                  unit={m.unit}
                  values={values}
                  decimals={m.decimals}
                  statusHex={hasRule ? STATUS_STYLE[status].hex : "#94a3b8"}
                  refLines={[...(REF_LINES[id] ?? []), ...flagLine]}
                  projection={projection}
                />
                {projection && projection.kind !== "insufficient" && (
                  <p className="mt-1 text-sm">
                    <span aria-hidden="true">⏱ </span>
                    {describeProjection(projection, m.label, m.unit, m.decimals)}{" "}
                    <DemoBadge label="Demo parameters" />
                  </p>
                )}
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
          <CheckIn
            title={form.title}
            fields={form.fields}
            blocked={blocked}
            onSubmit={(values) => onCheckIn(form.compose ? form.compose(values) : values)}
          />
        </div>
      )}

      {regionId === "stomach" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <NutritionLog onSubmit={onCheckIn} />
          <MealSurvey onSubmit={(r) => onCheckIn([{ indicator: "meal_rating", value: r }])} />
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
        {regionId !== "bones" && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          Thresholds: <DemoBadge />
        </div>}
      </div>
    </section>
  );
}
