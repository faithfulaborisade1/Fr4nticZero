import { describe, expect, it } from "vitest";
import { INDICATORS, generateHistory } from "./generator";

describe("generateHistory", () => {
  it("is repeatable for the same seed", () => {
    expect(generateHistory(7, 30)).toEqual(generateHistory(7, 30));
  });

  it("differs between seeds", () => {
    expect(generateHistory(1, 30)).not.toEqual(generateHistory(2, 30));
  });

  it("covers the six required indicators for 30 days within range", () => {
    const h = generateHistory(2026, 30);
    for (const id of ["bp_systolic", "glucose", "hr", "mood", "sleep", "temp"]) {
      expect(h[id]).toHaveLength(30);
    }
    for (const spec of INDICATORS) {
      expect(h[spec.id]).toHaveLength(30);
      for (const v of h[spec.id]) {
        expect(v).toBeGreaterThanOrEqual(spec.min);
        expect(v).toBeLessThanOrEqual(spec.max);
      }
    }
  });
});
