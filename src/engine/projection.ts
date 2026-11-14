import { computeBaseline } from "./baseline";

/**
 * On-board trend projection. A straight line is fitted to the last few readings and
 * extended to say roughly when the reading would reach the flag level IF the trend
 * continued. It is plain statistics that runs on the device, not a trained model, and it
 * is a projection, never a prediction or a diagnosis. All settings are DEMO values.
 */
export interface FlagSpec {
  direction: "high" | "low";
  /** Flag level is the crew member's usual (mean) plus or minus this many standard deviations. */
  sd: number;
}

export type ProjectionKind =
  | "insufficient" // not enough readings
  | "already" // already at or past the flag level
  | "toward" // clear trend that reaches the flag level within the horizon
  | "slow" // clear trend toward the level, but not within the horizon
  | "flat" // no clear trend
  | "away"; // clear trend away from the flag level

export interface ProjectedPoint {
  /** Readings ahead of the latest one. */
  k: number;
  y: number;
  lo: number;
  hi: number;
}

export interface Projection {
  kind: ProjectionKind;
  direction: FlagSpec["direction"];
  /** Flag level: your usual plus or minus the allowed sd. */
  level: number;
  /** Change per reading (per day for daily readings). */
  slope: number;
  /** Readings used for the fit. */
  window: number;
  /** Readings until the flag level, only for "toward" and "slow". */
  daysToFlag: number | null;
  /** Next few fitted points with an approximate 95% band. */
  points: ProjectedPoint[];
}

export const PROJECTION_WINDOW = 7;
export const PROJECTION_HORIZON = 14;
export const PROJECTION_AHEAD = 5;
/** Smallest trend we treat as real: this fraction of your usual spread per day. */
const MIN_SLOPE_SD = 0.15;
const MIN_PRIOR = 7;

export function projectTrend(
  series: number[],
  flag: FlagSpec,
  window = PROJECTION_WINDOW,
): Projection {
  const empty: Projection = {
    kind: "insufficient",
    direction: flag.direction,
    level: 0,
    slope: 0,
    window,
    daysToFlag: null,
    points: [],
  };
  if (series.length < window + MIN_PRIOR) return empty;

  // "Usual" comes from the readings before the window, so a slow drift cannot hide inside it.
  const base = computeBaseline(series.slice(0, -window));
  const level = flag.direction === "high" ? base.mean + flag.sd * base.sd : base.mean - flag.sd * base.sd;

  const y = series.slice(-window);
  const n = y.length;
  const xm = (n - 1) / 2;
  const ym = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (i - xm) ** 2;
    sxy += (i - xm) * (y[i] - ym);
  }
  const slope = sxy / sxx;
  const intercept = ym - slope * xm;
  const rss = y.reduce((a, v, i) => a + (v - (intercept + slope * i)) ** 2, 0);
  const s = Math.sqrt(rss / Math.max(1, n - 2));
  const se = s / Math.sqrt(sxx);
  const fitLast = intercept + slope * (n - 1);

  const points: ProjectedPoint[] = Array.from({ length: PROJECTION_AHEAD }, (_, j) => {
    const k = j + 1;
    const x = n - 1 + k;
    const half = 1.96 * s * Math.sqrt(1 + 1 / n + (x - xm) ** 2 / sxx);
    const fit = intercept + slope * x;
    return { k, y: fit, lo: fit - half, hi: fit + half };
  });

  const latest = series[series.length - 1];
  const high = flag.direction === "high";
  const common = { direction: flag.direction, level, slope, window, points };

  if (high ? latest >= level : latest <= level) {
    return { kind: "already", ...common, daysToFlag: 0 };
  }

  // A trend is only "clear" if it is much larger than its own noise and big enough to matter.
  const clear = Math.abs(slope) > 2 * se && Math.abs(slope) >= MIN_SLOPE_SD * base.sd;
  if (!clear) return { kind: "flat", ...common, daysToFlag: null };

  const toward = high ? slope > 0 : slope < 0;
  if (!toward) return { kind: "away", ...common, daysToFlag: null };

  const days = Math.max(0, (level - fitLast) / slope);
  return {
    kind: days <= PROJECTION_HORIZON ? "toward" : "slow",
    ...common,
    daysToFlag: days,
  };
}

/** One plain-language sentence. Always says it is a projection from recent readings. */
export function describeProjection(
  p: Projection,
  label: string,
  unit: string,
  decimals = 0,
): string {
  const lvl = `${p.level.toFixed(decimals)} ${unit}`;
  const basis = `from the last ${p.window} readings`;
  switch (p.kind) {
    case "insufficient":
      return "Not enough readings to project a trend yet.";
    case "already":
      return `${label} is already at or past your flag level (${lvl}).`;
    case "toward": {
      const d = p.daysToFlag!;
      const when = d < 1 ? "within a day" : `in about ${Math.round(d)} day${Math.round(d) === 1 ? "" : "s"}`;
      return `If this trend continues, ${label.toLowerCase()} reaches your flag level (${lvl}) ${when}. A projection ${basis}, not a diagnosis.`;
    }
    case "slow":
      return `${label} is drifting toward your flag level (${lvl}), but not within ${PROJECTION_HORIZON} days at this pace (${basis}).`;
    case "away":
      return `${label} is moving away from your flag level (${basis}).`;
    case "flat":
      return `No clear trend in the last ${p.window} readings (${basis}).`;
  }
}
