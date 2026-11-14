import { co2Status } from "./bands";
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
  /** Cabin CO2 above the symptom level while the vision check has changed. */
  eyesCo2: boolean;
  /** Meal ratings falling and intake dropping together. */
  menuFatigue: boolean;
  /** B-vitamin intake has been below plan for the last three days. */
  bBelowPlan: boolean;
  nudges: Nudge[];
}

type Series = Record<string, number[]>;

const MIN_PRIOR_DAYS = 7;
/** Demo compression of "two weeks": the menu-fatigue check looks at the last five days. */
const MENU_WINDOW = 5;

/** True when each of the last n values is more than `sds` baseline sd below (dir -1) or above (dir 1) the earlier mean. */
function lastNBeyond(series: number[] | undefined, n: number, dir: 1 | -1, sds = 1): boolean {
  if (!series || series.length < n + MIN_PRIOR_DAYS) return false;
  const b = computeBaseline(series.slice(0, -n));
  return series.slice(-n).every((v) => (dir === 1 ? v > b.mean + sds * b.sd : v < b.mean - sds * b.sd));
}

/** Mean of the last n values is more than `sds` baseline sd above (dir 1) or below (dir -1) the earlier mean. */
function meanBeyond(series: number[] | undefined, n: number, dir: 1 | -1, sds = 1): boolean {
  if (!series || series.length < n + MIN_PRIOR_DAYS) return false;
  const b = computeBaseline(series.slice(0, -n));
  const mean = series.slice(-n).reduce((a, c) => a + c, 0) / n;
  return dir === 1 ? mean > b.mean + sds * b.sd : mean < b.mean - sds * b.sd;
}

export function evaluateCrosslinks(history: Series): Crosslinks {
  const moodDown3 = lastNBeyond(history.mood, 3, -1);
  const sleepShort3 = lastNBeyond(history.sleep, 3, -1);
  const doseRising = meanBeyond(history.dose_daily, 3, 1);
  const immuneWatch = moodDown3 && sleepShort3 && doseRising;

  const co2 = history.co2;
  const eyes = history.eyes_score;
  const eyesCo2 =
    !!co2 &&
    co2.length > 0 &&
    co2Status(co2[co2.length - 1]) !== "ok" &&
    !!eyes &&
    eyes.length > 0 &&
    eyes[eyes.length - 1] >= 1;

  const ratingFalling = lastNBeyond(history.meal_rating, MENU_WINDOW, -1);
  // Intake is a small whole number, so ask for a clearer drop (1.5 sd) than for the other series.
  const intakeDropping = meanBeyond(history.meals_eaten, MENU_WINDOW, -1, 1.5);
  const menuFatigue = ratingFalling && intakeDropping;

  const b = history.b_vitamin_count;
  // Plan is all four B-vitamins every day. Below plan = average of the last three days under 3.5 of 4.
  const bBelowPlan = !!b && b.length >= 3 && b.slice(-3).reduce((a, c) => a + c, 0) / 3 < 3.5;

  const nudges: Nudge[] = [];
  if (moodDown3) {
    nudges.push({
      id: "mood_down_3",
      text: "Mood has been below your usual for three days. Call home or join a crew activity today.",
    });
  }
  return { moodDown3, sleepShort3, doseRising, immuneWatch, eyesCo2, menuFatigue, bBelowPlan, nudges };
}

export const IMMUNE_LINK_NOTE =
  "Under investigation: low mood, short sleep and rising radiation dose together raise the immune watch level. This is a flag, not a finding.";

export const EYES_CO2_NOTE =
  "Under investigation: high cabin CO2 together with a vision change flags the eyes sooner. This is a flag, not a finding.";

export const MENU_FATIGUE_NOTE =
  "Under investigation: falling meal ratings and lower intake together may point to menu fatigue. This is a flag, not a finding.";

export const B_VITAMIN_NOTE =
  "B-vitamin intake is below plan. Top up as planned and re-check your vision. Under investigation: one astronaut improved after B-vitamin work, and causation is not confirmed.";
