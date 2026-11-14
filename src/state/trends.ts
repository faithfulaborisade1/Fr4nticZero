import { indicatorLabel, INDICATOR_META } from "../data/indicators";
import type { History } from "../data/generator";
import { projectTrend, type Projection } from "../engine/projection";
import { RULES } from "../engine/rules";

export interface TrendEntry {
  indicator: string;
  label: string;
  unit: string;
  decimals: number;
  projection: Projection;
}

/** Trend projection for every indicator whose rule has a flag level. */
export function buildTrends(history: History): TrendEntry[] {
  const seen = new Set<string>();
  const out: TrendEntry[] = [];
  for (const rule of RULES) {
    if (!rule.flag || seen.has(rule.indicator)) continue;
    seen.add(rule.indicator);
    const series = history[rule.indicator];
    if (!series) continue;
    const meta = INDICATOR_META[rule.indicator];
    out.push({
      indicator: rule.indicator,
      label: meta?.label ?? indicatorLabel(rule.indicator),
      unit: meta?.unit ?? "",
      decimals: meta?.decimals ?? 0,
      projection: projectTrend(series, rule.flag),
    });
  }
  return out;
}

/** Trends heading toward their flag level within `maxDays`, soonest first. */
export function approaching(entries: TrendEntry[], maxDays = 7): TrendEntry[] {
  return entries
    .filter((e) => e.projection.kind === "toward" && (e.projection.daysToFlag ?? 99) <= maxDays)
    .sort((a, b) => (a.projection.daysToFlag ?? 0) - (b.projection.daysToFlag ?? 0));
}
