import { MINUTES_PER_DAY, type ClockState } from "./clock";
import type { CheckInEntry } from "./history";
import { DAILY_INDICATORS } from "./reminders";

/**
 * Light gamification for the daily routine (a challenge consideration). It rewards logging
 * and healthy habits only. Points and streaks are engagement, never a health score.
 */
export interface Routine {
  /** Daily check-ins logged today (of six). */
  checkIns: number;
  workout: boolean;
  /** Tasks done today of `total` (six check-ins and one workout). */
  done: number;
  total: number;
  percent: number;
  complete: boolean;
  /** Mission days in a row with all six check-ins logged. */
  streak: number;
  points: number;
}

/** Indicators manually logged during a given mission day (0-based). */
export function completedOnDay(entries: CheckInEntry[], clock: ClockState, day: number): Set<string> {
  const start = Date.parse(clock.startISO) + day * MINUTES_PER_DAY * 60_000;
  const end = start + MINUTES_PER_DAY * 60_000;
  return new Set(
    entries
      .filter((e) => {
        const t = Date.parse(e.atISO);
        return t >= start && t < end && DAILY_INDICATORS.some((id) => id === e.indicator);
      })
      .map((e) => e.indicator),
  );
}

export const POINTS = { checkIn: 10, workout: 20, perCrewMinute: 1 } as const;

export function routineFor(
  entries: CheckInEntry[],
  workoutsToday: number,
  crewMinutesToday: number,
  clock: ClockState,
): Routine {
  const today = Math.floor(clock.elapsedMin / MINUTES_PER_DAY);
  const checkIns = completedOnDay(entries, clock, today).size;
  const workout = workoutsToday > 0;
  const total = DAILY_INDICATORS.length + 1;
  const done = checkIns + (workout ? 1 : 0);

  const full = (d: number) => completedOnDay(entries, clock, d).size === DAILY_INDICATORS.length;
  let streak = 0;
  let d = full(today) ? today : today - 1;
  while (d >= 0 && full(d)) {
    streak++;
    d--;
  }

  return {
    checkIns,
    workout,
    done,
    total,
    percent: Math.round((done / total) * 100),
    complete: done === total,
    streak,
    points: checkIns * POINTS.checkIn + (workout ? POINTS.workout : 0) + Math.round(crewMinutesToday * POINTS.perCrewMinute),
  };
}
