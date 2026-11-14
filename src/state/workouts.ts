import { MINUTES_PER_DAY, type ClockState } from "./clock";
import type { WorkoutEntry } from "./crew";

/** Workout records use simulated mission time and never count future entries. */
export function workoutsToday(workouts: WorkoutEntry[], clock: ClockState): WorkoutEntry[] {
  const origin = Date.parse(clock.startISO);
  const start = origin + Math.floor(clock.elapsedMin / MINUTES_PER_DAY) * MINUTES_PER_DAY * 60_000;
  const end = start + MINUTES_PER_DAY * 60_000;
  const now = origin + clock.elapsedMin * 60_000;
  return workouts.filter((entry) => { const time = Date.parse(entry.atISO); return time >= start && time < end && time <= now; });
}
