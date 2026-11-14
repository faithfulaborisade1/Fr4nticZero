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

export const INDICATOR_META: Record<string, IndicatorMeta> = {
  bp_systolic: { id: "bp_systolic", label: "Systolic blood pressure", unit: "mmHg", decimals: 0, min: 70, max: 230, step: 1 },
  hr: { id: "hr", label: "Heart rate", unit: "bpm", decimals: 0, min: 30, max: 220, step: 1 },
  glucose: { id: "glucose", label: "Blood sugar", unit: "mg/dL", decimals: 0, min: 40, max: 400, step: 1 },
  temp: { id: "temp", label: "Body temperature", unit: "°C", decimals: 1, min: 34, max: 42, step: 0.1 },
  sleep: { id: "sleep", label: "Sleep", unit: "h", decimals: 1, min: 0, max: 14, step: 0.1 },
  mood: { id: "mood", label: "Mood", unit: "/5", decimals: 0, min: 1, max: 5, step: 1 },
  stress: { id: "stress", label: "Stress check", unit: "/5", decimals: 0, min: 1, max: 5, step: 1 },
  dose_daily: { id: "dose_daily", label: "Daily radiation dose", unit: "mSv", decimals: 2, min: 0, max: 5, step: 0.01 },
};

export function indicatorLabel(id: string): string {
  const m = INDICATOR_META[id];
  return m ? `${m.label} (${m.unit})` : id;
}

/** Indicators shown in each region's detail view. */
export const REGION_INDICATORS: Partial<Record<RegionId, string[]>> = {
  heart: ["bp_systolic", "hr", "glucose"],
  head: ["mood", "sleep", "stress"],
  skin: ["temp"],
  radiation: ["dose_daily"],
};

export const SLEEP_SOURCE = {
  title: "Barger et al., Lancet Neurology 2014 (news release)",
  url: "https://www.eurekalert.org/news-releases/541449",
};
