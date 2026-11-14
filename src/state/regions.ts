import { computeBaseline } from "../engine/baseline";
import { doseStatus } from "../engine/bands";
import {
  IMMUNE_LINK_NOTE,
  evaluateCrosslinks,
  type Crosslinks,
} from "../engine/crosslinks";
import { rulesForIndicator } from "../engine/rules";
import type { Context, Status } from "../engine/types";
import type { History } from "../data/generator";
import {
  SIMULATED_DOSE_BASE_MSV,
  STATIC_READINGS,
  type RegionId,
} from "../data/regions";

export interface RegionSummary {
  id: RegionId;
  status: Status;
  headline: string;
  detail?: string;
  /** Cross-link explanation, always labelled "under investigation". */
  note?: string;
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

export function cumulativeDoseMsv(history: History): number {
  return (
    SIMULATED_DOSE_BASE_MSV +
    (history.dose_daily ?? []).reduce((a, b) => a + b, 0)
  );
}

export function buildSummaries(
  history: History,
  links: Crosslinks = evaluateCrosslinks(history),
): Record<RegionId, RegionSummary> {
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
  const cumulative = cumulativeDoseMsv(history);
  out.radiation = {
    id: "radiation",
    status: doseStatus(cumulative),
    headline: `${Math.round(cumulative)} mSv total`,
    detail: `${latest(history, "dose_daily").toFixed(2)} mSv today · limit under 600`,
  };
  for (const id of ["eyes", "ear", "immune", "stomach", "bones"] as const) {
    out[id] = { id, ...STATIC_READINGS[id] };
  }
  if (links.immuneWatch) {
    out.immune = {
      id: "immune",
      status: worst([out.immune.status, "watch"]),
      headline: "Watch level raised",
      detail: "Under investigation",
      note: IMMUNE_LINK_NOTE,
    };
  }
  return out;
}
