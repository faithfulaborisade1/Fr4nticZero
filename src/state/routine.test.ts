import { describe, expect, it } from "vitest";
import { createClock, jumpToDay } from "./clock";
import { routineFor } from "./routine";
import { DAILY_INDICATORS } from "./reminders";
import type { CheckInEntry } from "./history";

const clock = jumpToDay(createClock("2026-11-14T08:00:00.000Z"), 5);
const dayISO = (day: number, hour = 9) =>
  new Date(Date.parse("2026-11-14T08:00:00.000Z") + day * 86_400_000 + (hour - 8) * 3_600_000).toISOString();
const fullDay = (day: number): CheckInEntry[] =>
  DAILY_INDICATORS.map((indicator) => ({ indicator, value: 1, atISO: dayISO(day, 8) }));

describe("daily routine", () => {
  it("starts empty", () => {
    const r = routineFor([], 0, 0, clock);
    expect(r).toMatchObject({ checkIns: 0, done: 0, total: 7, percent: 0, streak: 0, points: 0, complete: false });
  });

  it("counts today's check-ins, a workout and crew minutes as points", () => {
    const entries: CheckInEntry[] = [
      { indicator: "mood", value: 4, atISO: dayISO(5, 8) },
      { indicator: "sleep", value: 7, atISO: dayISO(5, 8) },
      { indicator: "sleep", value: 7, atISO: dayISO(5, 8) }, // a second entry for one indicator counts once
    ];
    const r = routineFor(entries, 1, 8, clock);
    expect(r.checkIns).toBe(2);
    expect(r.workout).toBe(true);
    expect(r.done).toBe(3);
    expect(r.points).toBe(2 * 10 + 20 + 8);
  });

  it("ignores entries from other days and non-routine indicators", () => {
    const entries: CheckInEntry[] = [
      { indicator: "mood", value: 4, atISO: dayISO(4) },
      { indicator: "eyes_score", value: 1, atISO: dayISO(5, 8) },
    ];
    expect(routineFor(entries, 0, 0, clock).checkIns).toBe(0);
  });

  it("completes with six check-ins and a workout", () => {
    const r = routineFor(fullDay(5), 1, 0, clock);
    expect(r.complete).toBe(true);
    expect(r.percent).toBe(100);
  });

  it("counts a streak of full days, including today once complete", () => {
    const entries = [...fullDay(3), ...fullDay(4)];
    expect(routineFor(entries, 0, 0, clock).streak).toBe(2); // today not done yet
    expect(routineFor([...entries, ...fullDay(5)], 0, 0, clock).streak).toBe(3);
  });

  it("breaks the streak on a missed day", () => {
    const entries = [...fullDay(2), ...fullDay(4)];
    expect(routineFor(entries, 0, 0, clock).streak).toBe(1);
  });
});
