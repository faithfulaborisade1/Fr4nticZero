import type { RegionId } from "./regions";

export interface IndicatorMeta {
  id: string;
  label: string;
  unit: string;
  decimals: number;
  min: number;
  max: number;
  step: number;
}

const m = (
  id: string,
  label: string,
  unit: string,
  decimals: number,
  min: number,
  max: number,
  step: number,
): [string, IndicatorMeta] => [id, { id, label, unit, decimals, min, max, step }];

export const INDICATOR_META: Record<string, IndicatorMeta> = Object.fromEntries([
  m("bp_systolic", "Systolic blood pressure", "mmHg", 0, 70, 230, 1),
  m("hr", "Heart rate", "bpm", 0, 30, 220, 1),
  m("glucose", "Blood sugar", "mg/dL", 0, 40, 400, 1),
  m("temp", "Body temperature", "°C", 1, 34, 42, 0.1),
  m("sleep", "Sleep", "h", 1, 0, 14, 0.1),
  m("mood", "Mood", "/5", 0, 1, 5, 1),
  m("stress", "Stress check", "/5", 0, 1, 5, 1),
  m("dose_daily", "Daily radiation dose", "mSv", 2, 0, 5, 0.01),
  m("eyes_score", "Vision check score", "of 9", 0, 0, 9, 1),
  m("co2", "Cabin CO2", "mmHg", 2, 0.5, 8, 0.01),
  m("meals_eaten", "Meals eaten", "of 3", 0, 0, 3, 1),
  m("b_vitamin_count", "B-vitamin intake (B2, B6, B9, B12)", "of 4", 0, 0, 4, 1),
  m("body_mass", "Body mass", "kg", 1, 40, 150, 0.1),
  m("meal_rating", "Meal rating", "/5", 1, 1, 5, 0.1),
  // Parts of the weekly vision questionnaire. They are summed into eyes_score and not stored on their own.
  m("eyes_vision", "Near-vision change", "0 to 3", 0, 0, 3, 1),
  m("eyes_headache", "Headaches", "0 to 3", 0, 0, 3, 1),
  m("eyes_fullness", "Head fullness", "0 to 3", 0, 0, 3, 1),
  // Parts of the weekly meal survey. They are averaged into meal_rating.
  m("survey_taste", "Taste", "/5", 0, 1, 5, 1),
  m("survey_appearance", "Appearance", "/5", 0, 1, 5, 1),
  m("survey_texture", "Texture", "/5", 0, 1, 5, 1),
  m("survey_smell", "Smell", "/5", 0, 1, 5, 1),
]);

export function indicatorLabel(id: string): string {
  const meta = INDICATOR_META[id];
  return meta ? `${meta.label} (${meta.unit})` : id;
}

/** Indicators shown as trend charts in each region's detail view. */
export const REGION_INDICATORS: Partial<Record<RegionId, string[]>> = {
  heart: ["bp_systolic", "hr", "glucose"],
  head: ["mood", "sleep", "stress"],
  eyes: ["eyes_score", "co2"],
  stomach: ["meal_rating", "meals_eaten", "body_mass"],
  skin: ["temp"],
  radiation: ["dose_daily"],
};

export const SLEEP_SOURCE = {
  title: "Barger et al., Lancet Neurology 2014 (news release)",
  url: "https://www.eurekalert.org/news-releases/541449",
};

export const SANS_SOURCE = {
  title: "NASA: Crewmember SANS overview",
  url: "https://ntrs.nasa.gov/api/citations/20230006218/downloads/Brunstetter%20-%20Crewmember%20SANS%20Overview%20-%20Export%20Control%20-FINAL%20-%2001May23.pdf",
};
