import { describe, expect, it } from "vitest";
import { ALL_WORKING, DEVICES, deviceForIndicator, failedDeviceFor, isDown } from "../data/devices";
import { generateHistory } from "../data/generator";
import { getScenario } from "../data/scenarios";
import { approaching, buildTrends } from "../state/trends";
import { visibleHistory } from "../state/history";
import { indicatorStatus } from "../state/regions";
import { describeProjection, projectTrend } from "./projection";
import { RULES } from "./rules";

const HIGH = { direction: "high", sd: 2 } as const;
const LOW = { direction: "low", sd: 1.5 } as const;

// 14 steady readings around 100 (sd about 2), then a 7 reading window.
const usual = [98, 102, 100, 99, 101, 100, 98, 102, 100, 99, 101, 100, 99, 101];
const withWindow = (w: number[]) => [...usual, ...w];

describe("projectTrend", () => {
  it("needs enough readings", () => {
    expect(projectTrend([100, 101, 102], HIGH).kind).toBe("insufficient");
  });

  it("projects when a clear rise will reach the flag level", () => {
    const p = projectTrend(withWindow([96, 97, 98, 99, 100, 101, 102]), HIGH);
    expect(p.kind).toBe("toward");
    expect(p.slope).toBeCloseTo(1, 5);
    expect(p.level).toBeGreaterThan(102); // not there yet
  });

  it("gives days to the flag level", () => {
    const p = projectTrend(withWindow([95, 96, 97, 98, 99, 100, 101]), HIGH);
    expect(p.kind).toBe("toward");
    const expected = (p.level - 101) / 1;
    expect(p.daysToFlag).toBeCloseTo(expected, 5);
    expect(p.daysToFlag).toBeGreaterThan(0);
  });

  it("says already when the latest reading is at or past the level", () => {
    const p = projectTrend(withWindow([100, 101, 103, 105, 107, 109, 112]), HIGH);
    expect(p.kind).toBe("already");
    expect(p.daysToFlag).toBe(0);
  });

  it("does not call noise a trend", () => {
    const p = projectTrend(withWindow([100, 103, 98, 102, 99, 101, 100]), HIGH);
    expect(p.kind).toBe("flat");
    expect(p.daysToFlag).toBeNull();
  });

  it("recognises a clear move away from the flag level", () => {
    const p = projectTrend(withWindow([106, 105, 104, 103, 102, 101, 100]), HIGH);
    // latest 100 is below the level and the trend is down
    expect(p.kind).toBe("away");
  });

  it("works for low-is-bad indicators", () => {
    const p = projectTrend(withWindow([105, 104, 103, 102, 101, 100, 99]), LOW);
    expect(p.kind).toBe("toward");
    expect(p.slope).toBeLessThan(0);
    expect(p.level).toBeLessThan(100);
  });

  it("calls a slow drift slow", () => {
    const p = projectTrend(withWindow([99.0, 99.1, 99.2, 99.3, 99.4, 99.5, 99.6]), HIGH);
    // tiny clear slope, far from the level
    expect(["slow", "flat"]).toContain(p.kind);
  });

  it("uses the readings before the window as 'usual'", () => {
    const a = projectTrend(withWindow([100, 101, 102, 103, 104, 105, 106]), HIGH);
    const b = projectTrend([...usual.slice(0, 7), ...usual.slice(7), 120, 121, 122, 123, 124, 125, 126], HIGH);
    expect(b.level).toBeCloseTo(a.level, 5); // window values do not move the flag level
  });

  it("projects five points with a widening band", () => {
    const p = projectTrend(withWindow([94, 97, 96, 99, 98, 101, 100]), HIGH);
    expect(p.points).toHaveLength(5);
    const w = p.points.map((q) => q.hi - q.lo);
    for (let i = 1; i < w.length; i++) expect(w[i]).toBeGreaterThan(w[i - 1]);
    expect(p.points[0].y).toBeGreaterThan(p.points[0].lo);
    expect(p.points[0].y).toBeLessThan(p.points[0].hi);
  });
});

describe("describeProjection", () => {
  it("always says it is a projection and never diagnoses", () => {
    const toward = projectTrend(withWindow([95, 96, 97, 98, 99, 100, 101]), HIGH);
    const text = describeProjection(toward, "Systolic blood pressure", "mmHg");
    expect(text).toMatch(/If this trend continues/);
    expect(text).toMatch(/projection/i);
    expect(text).not.toMatch(/diagnos(e|is) (you|that)|will have|you have/i);
  });

  it("covers every kind", () => {
    const kinds = [
      projectTrend([1, 2], HIGH),
      projectTrend(withWindow([100, 101, 103, 105, 107, 109, 112]), HIGH),
      projectTrend(withWindow([100, 103, 98, 102, 99, 101, 100]), HIGH),
      projectTrend(withWindow([106, 105, 104, 103, 102, 101, 100]), HIGH),
    ];
    for (const k of kinds) expect(describeProjection(k, "X", "u").length).toBeGreaterThan(10);
  });
});

describe("scenario 4: slow blood pressure drift", () => {
  const base = generateHistory(2026, 30);
  const full = getScenario("bp_drift").apply(base);
  const at = (day: number) => visibleHistory(full, day - 1);
  const bp = (day: number) => buildTrends(at(day)).find((t) => t.indicator === "bp_systolic")!.projection;

  it("starts flat", () => {
    expect(bp(24).kind).toBe("flat");
  });

  it("warns days ahead while the daily rule check stays quiet", () => {
    expect(bp(25).kind).toBe("toward");
    expect(bp(25).daysToFlag!).toBeGreaterThan(2);
    expect(bp(25).daysToFlag!).toBeLessThan(6);
    expect(bp(26).daysToFlag!).toBeLessThan(bp(25).daysToFlag!);
    expect(indicatorStatus(at(25), "bp_systolic")).toBe("ok");
    expect(indicatorStatus(at(26), "bp_systolic")).toBe("ok");
  });

  it("then reports the reading is past the usual-based flag level", () => {
    expect(bp(28).kind).toBe("already");
  });

  it("surfaces the approaching trend for the trend watch", () => {
    expect(approaching(buildTrends(at(25))).map((t) => t.indicator)).toContain("bp_systolic");
    expect(approaching(buildTrends(at(24)))).toEqual([]);
  });

  it("raises nothing on an ordinary history", () => {
    expect(approaching(buildTrends(base))).toEqual([]);
  });
});

describe("equipment", () => {
  it("every rule step names a real device, and each device is described", () => {
    const ids = DEVICES.map((d) => d.id);
    for (const r of RULES) {
      for (const s of r.holdingSteps) if (s.device) expect(ids).toContain(s.device);
    }
    for (const d of DEVICES) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.fallback.length).toBeGreaterThan(10);
    }
  });

  it("a failed device is found through the indicator it produces", () => {
    expect(deviceForIndicator("bp_systolic")?.id).toBe("bp_cuff");
    const down = { ...ALL_WORKING, bp_cuff: false };
    expect(failedDeviceFor(down, "bp_systolic")?.id).toBe("bp_cuff");
    expect(failedDeviceFor(ALL_WORKING, "bp_systolic")).toBeUndefined();
    expect(failedDeviceFor(down, "hr")).toBeUndefined();
    expect(isDown(down, "bp_cuff")).toBe(true);
    expect(isDown(down, undefined)).toBe(false);
  });

  it("the blood pressure re-measure step needs the cuff", () => {
    const bp = RULES.find((r) => r.id === "bp_systolic_high")!;
    expect(bp.holdingSteps.some((s) => s.device === "bp_cuff")).toBe(true);
  });
});
