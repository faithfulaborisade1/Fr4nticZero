import { describe, expect, it } from "vitest";
import { CAREER_LIMIT_MSV, co2Status, doseStatus } from "../engine/bands";
import { REGIONS } from "../data/regions";
import { generateHistory } from "../data/generator";
import { buildSummaries, indicatorStatus, worst } from "./regions";

describe("bands", () => {
  it("bands CO2 by the published figures", () => {
    expect(co2Status(1.0)).toBe("ok");
    expect(co2Status(2.3)).toBe("watch");
    expect(co2Status(3.0)).toBe("watch");
    expect(co2Status(3.1)).toBe("act");
  });

  it("bands dose by fraction of the career limit", () => {
    expect(doseStatus(38)).toBe("ok");
    expect(doseStatus(CAREER_LIMIT_MSV * 0.5)).toBe("watch");
    expect(doseStatus(CAREER_LIMIT_MSV * 0.8)).toBe("act");
  });
});

describe("region summaries", () => {
  it("gives every region a status and a value", () => {
    const s = buildSummaries(generateHistory(2026, 30));
    for (const r of REGIONS) {
      expect(["ok", "watch", "act"]).toContain(s[r.id].status);
      expect(s[r.id].headline.length).toBeGreaterThan(0);
    }
  });

  it("turns the heart red when blood pressure spikes", () => {
    const h = generateHistory(2026, 30);
    h.bp_systolic = [...h.bp_systolic.slice(0, -1), 160];
    expect(indicatorStatus(h, "bp_systolic")).toBe("act");
    expect(buildSummaries(h).heart.status).toBe("act");
  });

  it("worst picks the most severe", () => {
    expect(worst(["ok", "act", "watch"])).toBe("act");
    expect(worst([])).toBe("ok");
  });
});
