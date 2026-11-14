import { describe, expect, it } from "vitest";
import { ALL_WORKING, carriedOn, deviceIssue, effectiveDevices, getDevice } from "../data/devices";
import { generateHistory } from "../data/generator";
import { MISSION_RISKS } from "../data/missionRisks";
import { getScenario } from "../data/scenarios";
import { parseSaved } from "../state/persist";
import { buildCards } from "../state/cards";
import { makeEnvironment } from "./environments";

describe("lunar rover environment", () => {
  it("uses the lunar relay delay range", () => {
    expect(makeEnvironment("rover").oneWayDelaySec).toBe(8);
    expect(makeEnvironment("rover", 60).oneWayDelaySec).toBe(14);
    expect(makeEnvironment("rover", 1).oneWayDelaySec).toBe(3);
  });

  it("gives the blood pressure spike the same verdict as the Moon base", () => {
    const h = getScenario("bp_spike").apply(generateHistory(2026, 30));
    const at = "2026-12-13T08:00:00.000Z";
    const rover = buildCards(h, makeEnvironment("rover", 14), at)[0].card.verdict;
    const moon = buildCards(h, makeEnvironment("moon", 14), at)[0].card.verdict;
    expect(rover).toBe(moon);
  });

  it("has a mission-risk profile", () => {
    expect(MISSION_RISKS.rover.risks.length).toBeGreaterThan(0);
  });

  it("only carries part of the kit", () => {
    expect(carriedOn("rover", "bp_cuff")).toBe(true);
    expect(carriedOn("rover", "ultrasound")).toBe(false);
    expect(carriedOn("station", "ultrasound")).toBe(true);
    const eff = effectiveDevices(ALL_WORKING, "rover");
    expect(eff.ultrasound).toBe(false);
    expect(eff.glucose_meter).toBe(false);
    expect(eff.bp_cuff).toBe(true);
  });

  it("keeps real failures on top of the rover kit", () => {
    const eff = effectiveDevices({ ...ALL_WORKING, bp_cuff: false }, "rover");
    expect(eff.bp_cuff).toBe(false);
  });

  it("describes a device left at base differently from a failure", () => {
    const us = getDevice("ultrasound")!;
    expect(deviceIssue(us, "rover").reason).toBe("at_base");
    expect(deviceIssue(us, "rover").title).toMatch(/at base/);
    expect(deviceIssue(us, "mars").reason).toBe("failed");
  });

  it("can be saved and restored", () => {
    const saved = {
      v: 1, scenarioId: "bp_spike", elapsedMin: 0, speed: 1, envId: "rover", delaySec: 8, blackout: false,
      hazard: "all", ledger: [], checkIns: [], dismissed: {},
      supplies: { kit: {}, pantry: [], minutesByDay: {}, done: {} },
    };
    expect(parseSaved(JSON.stringify(saved))?.envId).toBe("rover");
  });
});
