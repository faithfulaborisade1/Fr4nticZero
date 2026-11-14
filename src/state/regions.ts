import { computeBaseline } from "../engine/baseline";
import { doseStatus } from "../engine/bands";
import { rulesForIndicator } from "../engine/rules";
import type { Context, Status } from "../engine/types";
import type { History } from "../data/generator";
import {
  SIMULATED_DOSE,
  STATIC_READINGS,
  getRegionMeta,
  type RegionId,
} from "../data/regions";

export interface RegionSummary {
  id: RegionId;
  status: Status;
  headline: string;
  detail?: string;
}

const RANK: Record<Status, number> = { ok: 0, watch: 1, act: 2 };

export function worst(statuses: Status[]): Status {
  return statuses.reduce<Status>((a, b) => (RANK[b] > RANK[a] ? b : a), "ok");
}

/** Status of the latest reading of one indicator, judged against the 14 days before it. */
export function indicatorStatus(history: History, indicator: string): Status {
  const series = history[indicator] ?? [];
  if (series.length < 2) return "ok";
  const value = series[series.length - 1];
  const baseline = computeBaseline(series.slice(0, -1));
  const ctx: Context = { day: series.length - 1, recent: history };
  return worst(
    rulesForIndicator(indicator).map((r) => r.test(value, baseline, ctx)),
  );
}

export function latest(history: History, indicator: string): number {
  const s = history[indicator] ?? [];
  return s[s.length - 1];
}

export function buildSummaries(history: History): Record<RegionId, RegionSummary> {
  const st = (i: string) => indicatorStatus(history, i);
  const out = {} as Record<RegionId, RegionSummary>;

  out.heart = {
    id: "heart",
    status: worst([st("bp_systolic"), st("hr"), st("glucose")]),
    headline: `BP ${latest(history, "bp_systolic")} mmHg · ${latest(history, "hr")} bpm`,
    detail: `Glucose ${latest(history, "glucose")} mg/dL`,
  };
  out.head = {
    id: "head",
    status: worst([st("mood"), st("sleep")]),
    headline: `Mood ${latest(history, "mood")}/5 · Sleep ${latest(history, "sleep")} h`,
    detail: "Daily check-in",
  };
  out.skin = {
    id: "skin",
    status: st("temp"),
    headline: `${latest(history, "temp").toFixed(1)} °C`,
    detail: "Body temperature",
  };
  out.radiation = {
    id: "radiation",
    status: doseStatus(SIMULATED_DOSE.cumulativeMsv),
    headline: `${SIMULATED_DOSE.cumulativeMsv} mSv total`,
    detail: `${SIMULATED_DOSE.dailyMsv} mSv today · limit under 600`,
  };
  for (const id of ["eyes", "ear", "immune", "stomach", "bones"] as const) {
    out[id] = { id, ...STATIC_READINGS[id] };
  }
  return out;
}

export function regionLabel(id: RegionId): string {
  return getRegionMeta(id).label;
}
