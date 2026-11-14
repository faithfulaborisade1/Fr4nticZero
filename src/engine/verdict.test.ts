import { describe, expect, it } from "vitest";
import { computeBaseline } from "./baseline";
import { makeEnvironment } from "./environments";
import { getRule } from "./rules";
import { decideVerdict, earthReplyMin, evaluateRule } from "./verdict";
import type { Baseline, Context } from "./types";

const NOW = "2026-11-14T10:00:00.000Z";
const ctx: Context = { day: 10, recent: {} };
const bpBaseline: Baseline = { mean: 118, sd: 3, n: 14 };
const bpRule = getRule("bp_systolic_high")!;

const station = makeEnvironment("station");
const moon = makeEnvironment("moon", 14);
const mars = makeEnvironment("mars", 22 * 60);

function bp(value: number, env = station) {
  return evaluateRule(bpRule, value, bpBaseline, ctx, env, { nowISO: NOW });
}

describe("earthReplyMin", () => {
  it("is round trip plus ground allowance", () => {
    expect(earthReplyMin(22 * 60)).toBeCloseTo(44 + 15, 5);
    expect(earthReplyMin(0)).toBe(15);
    expect(earthReplyMin(30, 10)).toBe(11);
  });
});

describe("verdicts", () => {
  it("no card when the reading is fine", () => {
    expect(bp(119)).toBeNull();
  });

  it("consult_earth on Station for a blood pressure spike", () => {
    const card = bp(145, station)!;
    expect(card.verdict).toBe("consult_earth");
    expect(card.deadlineISO).toBe("2026-11-14T10:30:00.000Z");
    expect(card.recheckISO).toBeNull();
  });

  it("consult_earth on the Moon at max delay", () => {
    expect(bp(145, moon)!.verdict).toBe("consult_earth");
  });

  it("crew_decides at Mars distance (headline demo flip)", () => {
    const card = bp(145, mars)!;
    expect(card.verdict).toBe("crew_decides");
    expect(card.earthReplyMin).toBeGreaterThan(30);
  });

  it("crew_decides in blackout even on Station", () => {
    const card = bp(145, { ...station, blackout: true })!;
    expect(card.verdict).toBe("crew_decides");
  });

  it("monitor when the rule has no action window", () => {
    const mood = getRule("mood_low")!;
    const baseline: Baseline = { mean: 3.8, sd: 0.5, n: 14 };
    const card = evaluateRule(mood, 1, baseline, ctx, mars, { nowISO: NOW })!;
    expect(card.verdict).toBe("monitor");
    expect(card.deadlineISO).toBeNull();
    expect(card.recheckISO).not.toBeNull();
  });

  it("monitor when the reading is only on watch", () => {
    // 2.5 sd above baseline: watch, not act
    const card = bp(118 + 2.5 * 3, station)!;
    expect(card.status).toBe("watch");
    expect(card.verdict).toBe("monitor");
  });

  it("flips exactly at the window boundary", () => {
    const base = { windowMin: 30, status: "act" as const };
    // reply = 15 + 2*s/60. 30 min window -> equal at s = 450.
    expect(
      decideVerdict({ ...base, env: makeEnvironment("mars", 450) }).verdict,
    ).toBe("consult_earth");
    expect(
      decideVerdict({ ...base, env: makeEnvironment("mars", 451) }).verdict,
    ).toBe("crew_decides");
  });
});

describe("baseline", () => {
  it("uses only the last 14 values", () => {
    const values = [...Array(20).fill(100), ...Array(14).fill(50)];
    const b = computeBaseline(values);
    expect(b.mean).toBe(50);
    expect(b.n).toBe(14);
  });

  it("never returns a zero sd for a flat history", () => {
    expect(computeBaseline(Array(14).fill(60)).sd).toBeGreaterThan(0);
  });

  it("does not flag with too little history", () => {
    const thin: Baseline = { mean: 118, sd: 3, n: 2 };
    const card = evaluateRule(bpRule, 200, thin, ctx, station, { nowISO: NOW });
    expect(card).toBeNull();
  });
});
