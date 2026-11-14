import type { CheckInEntry } from "./history";
import { MINUTES_PER_DAY, type ClockState } from "./clock";

export const DAILY_INDICATORS = ["bp_systolic", "hr", "glucose", "temp", "sleep", "mood"] as const;

/** Only manually logged entries in the current simulated mission day complete a reminder. */
export function completedToday(entries: CheckInEntry[], clock: ClockState): Set<string> {
  const day = Math.floor(clock.elapsedMin / MINUTES_PER_DAY);
  const start = Date.parse(clock.startISO) + day * MINUTES_PER_DAY * 60_000;
  const end = start + MINUTES_PER_DAY * 60_000;
  const now = Date.parse(clock.startISO) + clock.elapsedMin * 60_000;
  return new Set(entries.filter((entry) => {
    const time = Date.parse(entry.atISO);
    return time >= start && time < end && time <= now && DAILY_INDICATORS.some((id) => id === entry.indicator);
  }).map((entry) => entry.indicator));
}
