import { describe, expect, it } from "vitest";
import { KIT } from "../data/kit";
import { HAZARDS, REGION_HAZARDS, regionInHazard } from "../data/hazards";
import { REGIONS } from "../data/regions";
import {
  eatMeal,
  initialSupplies,
  minutesToday,
  missingItem,
  stepKey,
  takeStep,
} from "../state/supplies";
import { escalation } from "./escalation";
import { RULES, getRule } from "./rules";
import { describeCorrelation, pearson } from "./stats";

describe("buddy escalation tiers", () => {
  it("watch readings stay with the crew member", () => {
    expect(escalation({ verdict: "monitor", status: "watch" }).tier).toBe("self");
  });

  it("act readings with time to ask Earth alert the buddy", () => {
    expect(escalation({ verdict: "consult_earth", status: "act" }).tier).toBe("buddy");
  });

  it("act readings with no action window still alert the buddy", () => {
    expect(escalation({ verdict: "monitor", status: "act" }).tier).toBe("buddy");
  });

  it("alert everyone when the crew must decide", () => {
    expect(escalation({ verdict: "crew_decides", status: "act" }).tier).toBe("all");
  });
});

describe("hazard tabs", () => {
  it("cover all five hazards with a figure and a source", () => {
    expect(HAZARDS.map((h) => h.id).sort()).toEqual(
      ["distance", "environment", "gravity", "isolation", "radiation"],
    );
    for (const h of HAZARDS) {
      expect(h.figure.length).toBeGreaterThan(0);
      expect(h.sources.length).toBeGreaterThan(0);
      for (const s of h.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it("give every region at least one hazard, and the filter matches", () => {
    for (const r of REGIONS) expect(REGION_HAZARDS[r.id].length).toBeGreaterThan(0);
    expect(regionInHazard("heart", "all")).toBe(true);
    expect(regionInHazard("heart", "gravity")).toBe(true);
    expect(regionInHazard("heart", "radiation")).toBe(false);
    expect(regionInHazard("stomach", "isolation")).toBe(true);
    expect(regionInHazard("immune", "radiation")).toBe(true);
  });

  it("agree with each rule's own hazard tag", () => {
    for (const rule of RULES) {
      const region = REGIONS.find((r) => r.id === rule.region);
      if (region) expect(REGION_HAZARDS[region.id]).toContain(rule.hazard);
    }
  });
});

describe("no unlabelled demo value", () => {
  it("every rule source is a link or the DEMO marker", () => {
    for (const r of RULES) {
      for (const s of [r.source, r.windowSource]) {
        expect(s === "DEMO" || /^https:\/\//.test(s.url)).toBe(true);
      }
    }
  });

  it("every step item exists in the kit", () => {
    const ids = KIT.map((k) => k.id);
    for (const r of RULES) {
      for (const step of r.holdingSteps) {
        for (const u of step.uses ?? []) expect(ids).toContain(u.item);
      }
    }
  });
});

describe("kit, pantry and crew time", () => {
  const bp = getRule("bp_systolic_high")!;
  const day = 29;

  it("taking a step uses stock and adds crew minutes", () => {
    const s0 = initialSupplies();
    const step = bp.holdingSteps[1]; // re-measure, uses a cuff cover
    const key = stepKey("card1", 1);
    const s1 = takeStep(s0, key, step, day);
    expect(s1.kit.bp_cuff_cover).toBe(s0.kit.bp_cuff_cover - 1);
    expect(minutesToday(s1, day)).toBe(step.crewMinutes);
    expect(s1.done[key]).toBe(true);
  });

  it("a step can only be taken once", () => {
    const step = bp.holdingSteps[1];
    const key = stepKey("card1", 1);
    const s1 = takeStep(initialSupplies(), key, step, day);
    const s2 = takeStep(s1, key, step, day);
    expect(s2).toBe(s1);
  });

  it("cannot take a step when the kit item is out of stock", () => {
    const s = initialSupplies();
    s.kit.bp_cuff_cover = 0;
    const step = bp.holdingSteps[1];
    expect(missingItem(s, step)).toBe("bp_cuff_cover");
    expect(takeStep(s, stepKey("c", 1), step, day)).toBe(s);
  });

  it("steps with no items cost only time", () => {
    const step = bp.holdingSteps[0];
    const s1 = takeStep(initialSupplies(), stepKey("c", 0), step, day);
    expect(s1.kit).toEqual(initialSupplies().kit);
    expect(minutesToday(s1, day)).toBe(5);
  });

  it("eating a meal uses one from the pantry and resets days since eaten", () => {
    const s0 = initialSupplies();
    const chicken = s0.pantry.find((p) => p.id === "thermostab_chicken")!;
    const s1 = eatMeal(s0, "thermostab_chicken");
    const after = s1.pantry.find((p) => p.id === "thermostab_chicken")!;
    expect(after.qty).toBe(chicken.qty - 1);
    expect(after.daysSinceEaten).toBe(0);
  });

  it("never takes the pantry below zero", () => {
    const s0 = initialSupplies();
    const out = s0.pantry.find((p) => p.qty === 0)!;
    expect(eatMeal(s0, out.id).pantry.find((p) => p.id === out.id)!.qty).toBe(0);
  });
});

describe("correlation for the dot plot", () => {
  it("is 1 for a perfect line and -1 for the reverse", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 10);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1, 10);
  });

  it("is null without enough data or variation", () => {
    expect(pearson([1, 2], [1, 2])).toBeNull();
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeNull();
  });

  it("pairs by position when lengths differ", () => {
    expect(pearson([1, 2, 3, 4, 99], [2, 4, 6, 8])).toBeCloseTo(1, 10);
  });

  it("describes the result without claiming a cause", () => {
    expect(describeCorrelation(-0.8)).toMatch(/strong negative relationship/);
    expect(describeCorrelation(0.1)).toMatch(/No clear/);
    expect(describeCorrelation(null)).toMatch(/Not enough/);
    expect(describeCorrelation(0.9)).not.toMatch(/cause/i);
  });
});
