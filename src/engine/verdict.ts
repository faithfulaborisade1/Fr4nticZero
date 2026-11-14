import type {
  Baseline,
  Context,
  DecisionCard,
  Environment,
  Rule,
  Verdict,
} from "./types";

/** DEMO parameter: minutes the ground team needs to respond once a message arrives. Shown in settings. */
export const GROUND_RESPONSE_MIN = 15;

export function earthReplyMin(
  oneWayDelaySec: number,
  groundResponseMin = GROUND_RESPONSE_MIN,
): number {
  return (2 * oneWayDelaySec) / 60 + groundResponseMin;
}

export interface VerdictInput {
  windowMin: number | null;
  status: "watch" | "act";
  env: Environment;
  groundResponseMin?: number;
}

export function decideVerdict(i: VerdictInput): {
  verdict: Verdict;
  earthReplyMin: number;
} {
  const reply = earthReplyMin(i.env.oneWayDelaySec, i.groundResponseMin);
  if (i.windowMin === null || i.status === "watch") {
    return { verdict: "monitor", earthReplyMin: reply };
  }
  if (i.env.blackout || reply > i.windowMin) {
    return { verdict: "crew_decides", earthReplyMin: reply };
  }
  return { verdict: "consult_earth", earthReplyMin: reply };
}

function addMin(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60_000).toISOString();
}

export interface EvaluateOptions {
  nowISO: string;
  groundResponseMin?: number;
  idSuffix?: string;
}

/** Run one rule against one reading. Returns null when the reading is fine. */
export function evaluateRule(
  rule: Rule,
  value: number,
  baseline: Baseline,
  ctx: Context,
  env: Environment,
  opts: EvaluateOptions,
): DecisionCard | null {
  const status = rule.test(value, baseline, ctx);
  if (status === "ok") return null;

  const { verdict, earthReplyMin: reply } = decideVerdict({
    windowMin: rule.actionWindowMin,
    status,
    env,
    groundResponseMin: opts.groundResponseMin,
  });

  return {
    id: `${rule.id}@${opts.nowISO}${opts.idSuffix ?? ""}`,
    ruleId: rule.id,
    value,
    verdict,
    status,
    earthReplyMin: reply,
    deadlineISO:
      verdict === "monitor" || rule.actionWindowMin === null
        ? null
        : addMin(opts.nowISO, rule.actionWindowMin),
    recheckISO:
      verdict === "monitor"
        ? addMin(opts.nowISO, rule.recheckMin ?? 60 * 12)
        : null,
    queuedAtISO: opts.nowISO,
  };
}
