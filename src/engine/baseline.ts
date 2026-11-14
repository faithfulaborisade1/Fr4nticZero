import type { Baseline, Status } from "./types";

/** Smallest sd we trust, so a flat history cannot make every wobble an alarm. */
const MIN_SD_FRACTION = 0.01;

export function computeBaseline(values: number[], window = 14): Baseline {
  const recent = values.slice(-window);
  const n = recent.length;
  if (n === 0) return { mean: 0, sd: 0, n: 0 };
  const mean = recent.reduce((a, b) => a + b, 0) / n;
  const variance =
    n > 1 ? recent.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  const sd = Math.max(Math.sqrt(variance), Math.abs(mean) * MIN_SD_FRACTION);
  return { mean, sd, n };
}

export function zScore(value: number, b: Baseline): number {
  return b.sd === 0 ? 0 : (value - b.mean) / b.sd;
}

export interface DeviationOptions {
  /** Standard deviations from baseline that raise "watch". */
  watchSd: number;
  /** Standard deviations from baseline that raise "act". */
  actSd: number;
  /** Which way is bad. */
  direction: "high" | "low" | "both";
}

/** Build a rule test that flags deviation from the personal baseline. All thresholds are DEMO values. */
export function deviationTest(opts: DeviationOptions) {
  return (value: number, baseline: Baseline): Status => {
    if (baseline.n < 3) return "ok";
    const z = zScore(value, baseline);
    const d =
      opts.direction === "high" ? z : opts.direction === "low" ? -z : Math.abs(z);
    if (d >= opts.actSd) return "act";
    if (d >= opts.watchSd) return "watch";
    return "ok";
  };
}
