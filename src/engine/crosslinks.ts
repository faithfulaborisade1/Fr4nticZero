import { computeBaseline } from "./baseline";

// Cross-links between hazards are labelled "under investigation" wherever they are shown.
// All thresholds here are DEMO values.

export interface Nudge {
  id: string;
  text: string;
}

export interface Crosslinks {
  moodDown3: boolean;
  sleepShort3: boolean;
  doseRising: boolean;
  /** Mood down + sleep short + dose rising raises the immune watch level. */
  immuneWatch: boolean;
  nudges: Nudge[];
}

type Series = Record<string, number[]>;

const MIN_PRIOR_DAYS = 7;

/** True when each of the last n values is more than `sds` baseline sd below (dir -1) or above (dir 1) the earlier mean. */
function lastNBeyond(series: number[] | undefined, n: number, dir: 1 | -1, sds = 1): boolean {
  if (!series || series.length < n + MIN_PRIOR_DAYS) return false;
  const b = computeBaseline(series.slice(0, -n));
  return series.slice(-n).every((v) => (dir === 1 ? v > b.mean + sds * b.sd : v < b.mean - sds * b.sd));
}

/** Mean of the last n values is more than `sds` baseline sd above the earlier mean. */
function meanRising(series: number[] | undefined, n: number, sds = 1): boolean {
  if (!series || series.length < n + MIN_PRIOR_DAYS) return false;
  const b = computeBaseline(series.slice(0, -n));
  const mean = series.slice(-n).reduce((a, c) => a + c, 0) / n;
  return mean > b.mean + sds * b.sd;
}

export function evaluateCrosslinks(history: Series): Crosslinks {
  const moodDown3 = lastNBeyond(history.mood, 3, -1);
  const sleepShort3 = lastNBeyond(history.sleep, 3, -1);
  const doseRising = meanRising(history.dose_daily, 3);
  const immuneWatch = moodDown3 && sleepShort3 && doseRising;

  const nudges: Nudge[] = [];
  if (moodDown3) {
    nudges.push({
      id: "mood_down_3",
      text: "Mood has been below your usual for three days. Call home or join a crew activity today.",
    });
  }
  return { moodDown3, sleepShort3, doseRising, immuneWatch, nudges };
}

export const IMMUNE_LINK_NOTE =
  "Under investigation: low mood, short sleep and rising radiation dose together raise the immune watch level. This is a flag, not a finding.";
