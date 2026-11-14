import { describe, expect, it } from "vitest";
import { createClock, jumpToDay, missionDay, nowISO, pause, play, tick } from "./clock";

describe("mission clock", () => {
  it("does not advance while paused", () => {
    const c = createClock();
    expect(tick(c, 10).elapsedMin).toBe(0);
  });

  it("advances by speed while playing and stops on pause", () => {
    let c = play(createClock(undefined, 60));
    c = tick(c, 2);
    expect(c.elapsedMin).toBe(120);
    c = tick(pause(c), 5);
    expect(c.elapsedMin).toBe(120);
  });

  it("jumps to a mission day", () => {
    const c = jumpToDay(createClock("2026-11-14T08:00:00.000Z"), 3);
    expect(missionDay(c)).toBe(3);
    expect(nowISO(c)).toBe("2026-11-17T08:00:00.000Z");
  });
});
