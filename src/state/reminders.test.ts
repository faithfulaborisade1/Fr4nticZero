import { describe, expect, it } from "vitest";
import { createClock, jumpToDay, nowISO } from "./clock";
import { completedToday } from "./reminders";

describe("simulated daily check-in reminders", () => {
  it("counts only manually logged indicators for the active mission day, once each", () => {
    const day = jumpToDay(createClock(), 1);
    const entries = [
      { indicator: "hr", value: 60, atISO: nowISO(day) },
      { indicator: "hr", value: 61, atISO: nowISO(day) },
      { indicator: "mood", value: 3, atISO: nowISO(day) },
      { indicator: "hr", value: 62, atISO: nowISO(jumpToDay(day, 0)) },
      { indicator: "temp", value: 36.6, atISO: nowISO(jumpToDay(day, 2)) },
      { indicator: "stress", value: 1, atISO: nowISO(day) },
    ];
    expect([...completedToday(entries, day)].sort()).toEqual(["hr", "mood"]);
    expect([...completedToday(entries, jumpToDay(day, 2))]).toEqual(["temp"]);
  });

  it("uses the mission-day boundary, not midnight on the calendar", () => {
    const clock = { ...createClock(), elapsedMin: 24 * 60 - 1 };
    const entry = { indicator: "hr", value: 60, atISO: nowISO(clock) };
    expect(completedToday([entry], clock).has("hr")).toBe(true);
    expect(completedToday([entry], { ...clock, elapsedMin: 24 * 60 }).has("hr")).toBe(false);
  });
});
