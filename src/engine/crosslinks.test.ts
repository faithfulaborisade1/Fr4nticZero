import { describe, expect, it } from "vitest";
import { generateHistory } from "../data/generator";
import { getScenario } from "../data/scenarios";
import { makeEnvironment } from "./environments";
import { evaluateCrosslinks } from "./crosslinks";
import { buildCards } from "../state/cards";
import { buildSummaries } from "../state/regions";
import { visibleHistory } from "../state/history";

const base = generateHistory(2026, 30);
const bad = getScenario("bad_week").apply(base);
const atDay = (day: number) => visibleHistory(bad, day - 1); // day is 1-based

describe("cross-links", () => {
  it("raise nothing on an ordinary history", () => {
    const l = evaluateCrosslinks(base);
    expect(l.immuneWatch).toBe(false);
    expect(l.nudges).toEqual([]);
  });

  it("stay quiet before the bad week starts", () => {
    expect(evaluateCrosslinks(atDay(25)).nudges).toEqual([]);
    expect(evaluateCrosslinks(atDay(26)).moodDown3).toBe(false);
  });

  it("nudge once mood has been down three days running", () => {
    const l = evaluateCrosslinks(atDay(28));
    expect(l.moodDown3).toBe(true);
    expect(l.nudges.map((n) => n.id)).toEqual(["mood_down_3"]);
  });

  it("raise the immune watch level when mood, sleep and dose all move", () => {
    const l = evaluateCrosslinks(atDay(28));
    expect(l.sleepShort3).toBe(true);
    expect(l.doseRising).toBe(true);
    expect(l.immuneWatch).toBe(true);
    const s = buildSummaries(atDay(28));
    expect(s.immune.status).toBe("watch");
    expect(s.immune.note).toMatch(/under investigation/i);
  });

  it("needs all three signals together", () => {
    const h = { ...atDay(28), dose_daily: base.dose_daily.slice(0, 28) };
    expect(evaluateCrosslinks(h).immuneWatch).toBe(false);
  });
});

describe("scenario 2: bad week", () => {
  it("turns the head amber or red and raises monitor cards by day 30", () => {
    const h = atDay(30);
    expect(buildSummaries(h).head.status).not.toBe("ok");
    const cards = buildCards(h, makeEnvironment("mars", 22 * 60), "2026-12-13T08:00:00.000Z");
    const ids = cards.map((c) => c.rule.id);
    expect(ids).toContain("mood_low");
    for (const c of cards) expect(c.card.verdict).toBe("monitor");
  });

  it("leaves the heart alone", () => {
    expect(buildSummaries(atDay(30)).heart.status).toBe("ok");
  });
});
