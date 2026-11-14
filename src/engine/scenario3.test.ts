import { describe, expect, it } from "vitest";
import { PANTRY, suggestMeals } from "../data/pantry";
import { generateHistory } from "../data/generator";
import { getScenario } from "../data/scenarios";
import { buildCards } from "../state/cards";
import { visibleHistory } from "../state/history";
import { buildSummaries } from "../state/regions";
import { makeEnvironment } from "./environments";
import { evaluateCrosslinks } from "./crosslinks";

const READING = "2026-12-13T08:00:00.000Z";
const base = generateHistory(2026, 30);
const vision = getScenario("vision_co2").apply(base);
const fatigue = getScenario("menu_fatigue").apply(base);
const day = (h: typeof base, d: number) => visibleHistory(h, d - 1); // 1-based
const mars = makeEnvironment("mars", 22 * 60);
const station = makeEnvironment("station");

function eyesCard(h: typeof base, env = mars) {
  return buildCards(h, env, READING).find((c) => c.rule.id === "eyes_vision_change");
}

describe("scenario 3: vision change with high cabin CO2", () => {
  it("is quiet before it starts", () => {
    const h = day(vision, 25);
    expect(buildSummaries(h).eyes.status).toBe("ok");
    expect(eyesCard(h)).toBeUndefined();
  });

  it("goes amber sooner because of the CO2", () => {
    const h = day(vision, 26); // eyes score 1, CO2 2.4
    expect(evaluateCrosslinks(h).eyesCo2).toBe(true);
    expect(buildSummaries(h).eyes.status).toBe("watch");
    expect(buildSummaries(h).eyes.note).toMatch(/under investigation/i);
    expect(eyesCard(h)?.card.verdict).toBe("monitor");
  });

  it("would not be amber at the same score with normal CO2", () => {
    const h = { ...day(vision, 26), co2: day(base, 26).co2 };
    expect(buildSummaries(h).eyes.status).toBe("ok");
  });

  it("goes red, and stays consult_earth even at Mars distance", () => {
    const h = day(vision, 29); // eyes score 4
    expect(buildSummaries(h).eyes.status).toBe("act");
    expect(eyesCard(h, mars)?.card.verdict).toBe("consult_earth");
    expect(eyesCard(h, station)?.card.verdict).toBe("consult_earth");
  });

  it("only a blackout makes the crew decide", () => {
    const h = day(vision, 30);
    expect(eyesCard(h, { ...mars, blackout: true })?.card.verdict).toBe("crew_decides");
  });

  it("shows the cabin CO2 band on the way", () => {
    expect(vision.co2.slice(-5)).toEqual([2.4, 2.6, 2.8, 3.1, 3.3]);
  });
});

describe("nutrition cross-links", () => {
  it("are quiet on ordinary history", () => {
    const l = evaluateCrosslinks(base);
    expect(l.menuFatigue).toBe(false);
    expect(l.bBelowPlan).toBe(false);
  });

  it("flag possible menu fatigue when ratings and intake both fall", () => {
    const l = evaluateCrosslinks(day(fatigue, 30));
    expect(l.menuFatigue).toBe(true);
    const s = buildSummaries(day(fatigue, 30));
    expect(s.stomach.status).toBe("watch");
    expect(s.stomach.note).toMatch(/under investigation/i);
  });

  it("need both signals", () => {
    const h = { ...day(fatigue, 30), meals_eaten: day(base, 30).meals_eaten };
    expect(evaluateCrosslinks(h).menuFatigue).toBe(false);
  });

  it("notice B-vitamin intake below plan", () => {
    expect(evaluateCrosslinks(day(fatigue, 30)).bBelowPlan).toBe(true);
  });
});

describe("pantry suggestions", () => {
  it("suggest in-stock meals not eaten recently, longest first", () => {
    const s = suggestMeals();
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(3);
    for (const p of s) {
      expect(p.qty).toBeGreaterThan(0);
      expect(p.daysSinceEaten).toBeGreaterThanOrEqual(14);
    }
    expect(s[0].daysSinceEaten).toBeGreaterThanOrEqual(s[s.length - 1].daysSinceEaten);
  });

  it("never suggest an item that is out of stock", () => {
    const out = PANTRY.filter((p) => p.qty === 0).map((p) => p.id);
    expect(suggestMeals().some((p) => out.includes(p.id))).toBe(false);
  });
});
