import { describe, expect, it } from "vitest";
import { DEVICES } from "./devices";
import { DEVICE_HOW_TO, HOW_TO } from "./howTo";
import { RULES } from "../engine/rules";

describe("how-to guides", () => {
  it("cover blood pressure and blood sugar", () => {
    expect(Object.keys(HOW_TO).sort()).toEqual(["bp_systolic", "glucose"]);
  });

  it("have short, sourced steps with a scene each", () => {
    for (const g of Object.values(HOW_TO)) {
      expect(g.steps.length).toBeGreaterThanOrEqual(3);
      expect(g.steps.length).toBeLessThanOrEqual(6);
      expect(g.source.url).toMatch(/^https:\/\//);
      const scenes = new Set(g.steps.map((s) => s.scene));
      expect(scenes.size).toBe(g.steps.length);
      for (const s of g.steps) {
        expect(s.title.length).toBeLessThan(50);
        expect(s.text.length).toBeLessThan(160);
      }
    }
  });

  it("never give doses or treatment instructions", () => {
    const text = Object.values(HOW_TO).flatMap((g) => g.steps.map((s) => `${s.text} ${s.space ?? ""}`)).join(" ");
    // "mg/dL" is a unit and allowed; a number followed by mg would be a dose.
    expect(text).not.toMatch(/\d+\s*mg\b(?!\/)|\b(tablet|insulin|dose|diagnos)/i);
  });

  it("link device steps on decision cards to a real guide and device", () => {
    const ids = DEVICES.map((d) => d.id);
    for (const [device, guide] of Object.entries(DEVICE_HOW_TO)) {
      expect(ids).toContain(device);
      expect(HOW_TO[guide]).toBeDefined();
    }
    const bp = RULES.find((r) => r.id === "bp_systolic_high")!;
    expect(bp.holdingSteps.some((s) => s.device && DEVICE_HOW_TO[s.device] === "bp_systolic")).toBe(true);
  });
});
