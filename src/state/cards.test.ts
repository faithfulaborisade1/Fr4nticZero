import { describe, expect, it } from "vitest";
import { generateHistory } from "../data/generator";
import { SCENARIOS, getScenario } from "../data/scenarios";
import { makeEnvironment } from "../engine/environments";
import { buildCards } from "./cards";
import { createClock, jumpToDay, missionTimeLabel, nowISO } from "./clock";

const READING = "2026-12-13T08:00:00.000Z";
const base = generateHistory(2026, 30);
const spike = getScenario("bp_spike").apply(base);

function bpVerdict(env: ReturnType<typeof makeEnvironment>) {
  const e = buildCards(spike, env, READING).find((c) => c.rule.id === "bp_systolic_high");
  return e?.card;
}

describe("scenario 1: blood pressure spike", () => {
  it("raises no cards on the unmodified history", () => {
    expect(buildCards(base, makeEnvironment("station"), READING)).toEqual([]);
  });

  it("is consult_earth on Station and crew_decides on Mars", () => {
    expect(bpVerdict(makeEnvironment("station"))?.verdict).toBe("consult_earth");
    expect(bpVerdict(makeEnvironment("mars", 22 * 60))?.verdict).toBe("crew_decides");
  });

  it("flips as the Mars delay slider moves", () => {
    // Window 30 min, ground 15 min: flips once round trip exceeds 15 min (450 s one way).
    expect(bpVerdict(makeEnvironment("mars", 7 * 60))?.verdict).toBe("consult_earth");
    expect(bpVerdict(makeEnvironment("mars", 8 * 60))?.verdict).toBe("crew_decides");
  });

  it("keeps the deadline fixed when the environment changes", () => {
    const a = bpVerdict(makeEnvironment("station"));
    const b = bpVerdict(makeEnvironment("mars", 22 * 60));
    expect(a?.deadlineISO).toBe(b?.deadlineISO);
    expect(a?.id).toBe(b?.id);
  });

  it("is crew_decides in blackout on Station", () => {
    const env = makeEnvironment("station", undefined, true);
    expect(bpVerdict(env)?.verdict).toBe("crew_decides");
  });

  it("every scenario applies without removing indicators", () => {
    for (const s of SCENARIOS) {
      const h = s.apply(base);
      expect(Object.keys(h).sort()).toEqual(Object.keys(base).sort());
      expect(h.bp_systolic).toHaveLength(30);
    }
  });
});

describe("missionTimeLabel", () => {
  it("labels a time as mission day and clock", () => {
    const c = jumpToDay(createClock("2026-11-14T08:00:00.000Z"), 29);
    expect(missionTimeLabel(c, nowISO(c))).toBe("Day 30 08:00");
    expect(missionTimeLabel(c, "2026-12-13T08:30:00.000Z")).toBe("Day 30 08:30");
  });
});
