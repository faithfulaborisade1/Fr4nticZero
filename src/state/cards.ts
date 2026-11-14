import { computeBaseline } from "../engine/baseline";
import { RULES } from "../engine/rules";
import type { Baseline, DecisionCard, Environment, Rule } from "../engine/types";
import { evaluateRule } from "../engine/verdict";
import type { History } from "../data/generator";

export interface CardEntry {
  card: DecisionCard;
  rule: Rule;
  baseline: Baseline;
}

const VERDICT_ORDER = { crew_decides: 0, consult_earth: 1, monitor: 2 } as const;

/**
 * Evaluate the latest reading of every indicator against its rule.
 * `readingISO` is when the reading was taken, so deadlines stay fixed while the
 * environment changes and the verdict re-evaluates live.
 */
export function buildCards(
  history: History,
  env: Environment,
  readingISO: string | ((indicator: string) => string),
  groundResponseMin?: number,
): CardEntry[] {
  const timeFor = typeof readingISO === "function" ? readingISO : () => readingISO;
  const out: CardEntry[] = [];
  for (const rule of RULES) {
    const series = history[rule.indicator];
    if (!series || series.length < 2) continue;
    const value = series[series.length - 1];
    const baseline = computeBaseline(series.slice(0, -1));
    const card = evaluateRule(
      rule,
      value,
      baseline,
      { day: series.length - 1, recent: history },
      env,
      { nowISO: timeFor(rule.indicator), groundResponseMin },
    );
    if (card) out.push({ card, rule, baseline });
  }
  return out.sort(
    (a, b) => VERDICT_ORDER[a.card.verdict] - VERDICT_ORDER[b.card.verdict],
  );
}
