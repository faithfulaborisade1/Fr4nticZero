export type Verdict = "crew_decides" | "consult_earth" | "monitor";
export type Hazard =
  | "radiation"
  | "isolation"
  | "distance"
  | "gravity"
  | "environment";
export type Status = "ok" | "watch" | "act";

export interface Source {
  title: string;
  url: string;
}

export interface Step {
  text: string;
  crewMinutes: number;
  uses?: { item: string; qty: number }[];
  /** Device this step needs. If it has failed the step is blocked and a fallback is shown. */
  device?: string;
}

/** Personal baseline: mean and standard deviation of the crew member's own recent readings. */
export interface Baseline {
  mean: number;
  sd: number;
  n: number;
}

export interface Context {
  /** Mission day, 0-based. */
  day: number;
  /** Recent history per indicator id, oldest first. Used by cross-links. */
  recent: Record<string, number[]>;
}

export interface Rule {
  id: string;
  indicator: string;
  region: string;
  hazard: Hazard;
  test: (value: number, baseline: Baseline, ctx: Context) => Status;
  /** Minutes before the finding needs action. null = monitor only. */
  actionWindowMin: number | null;
  holdingSteps: Step[];
  /** Plain language, 1-2 sentences. */
  explanation: string;
  measuredInSpace: string;
  needsEarth: string;
  /** Threshold source. "DEMO" = unsourced demo parameter. */
  source: Source | "DEMO";
  /** Action-window source. "DEMO" = unsourced demo parameter. */
  windowSource: Source | "DEMO";
  /** Minutes until re-check when the verdict is "monitor". */
  recheckMin?: number;
  /** Which way is bad and how far from your usual counts as the flag level. Used by the trend projection. DEMO. */
  flag?: { direction: "high" | "low"; sd: number };
}

export interface Environment {
  id: "station" | "moon" | "rover" | "mars";
  oneWayDelaySec: number;
  blackout: boolean;
}

export interface DecisionCard {
  id: string;
  ruleId: string;
  value: number;
  verdict: Verdict;
  status: Exclude<Status, "ok">;
  earthReplyMin: number;
  /** ISO time the action window closes. null for monitor. */
  deadlineISO: string | null;
  /** ISO time to re-check. Set for monitor verdicts. */
  recheckISO: string | null;
  crewChoice?: string;
  surgeonReview?: "concur" | "overrule";
  queuedAtISO: string;
  syncedAtISO?: string;
}
