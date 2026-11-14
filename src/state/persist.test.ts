import { describe, expect, it } from "vitest";
import { initialSupplies } from "./supplies";
import { STORAGE_KEY, clearSaved, loadSaved, parseSaved, saveState, type SavedState } from "./persist";

const sample: SavedState = {
  v: 1,
  scenarioId: "bad_week",
  elapsedMin: 25 * 1440,
  speed: 10,
  envId: "mars",
  delaySec: 1320,
  blackout: false,
  hazard: "gravity",
  ledger: [],
  checkIns: [{ indicator: "bp_systolic", value: 150, atISO: "2026-12-08T08:00:00.000Z" }],
  dismissed: { mood_down_3: true },
  supplies: initialSupplies(),
};

function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  };
}

describe("persistence", () => {
  it("round-trips a saved state", () => {
    const s = fakeStorage();
    expect(saveState(sample, s)).toBe(true);
    expect(loadSaved(s)).toEqual(sample);
  });

  it("returns null when nothing is saved", () => {
    expect(loadSaved(fakeStorage())).toBeNull();
  });

  it("ignores corrupt or foreign data", () => {
    expect(parseSaved("{not json")).toBeNull();
    expect(parseSaved("[]")).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, v: 2 }))).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, scenarioId: "nope" }))).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, envId: "venus" }))).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, elapsedMin: -5 }))).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, ledger: "x" }))).toBeNull();
    expect(parseSaved(JSON.stringify({ ...sample, supplies: { kit: {} } }))).toBeNull();
  });

  it("clears what it saved", () => {
    const s = fakeStorage();
    saveState(sample, s);
    clearSaved(s);
    expect(s.m.has(STORAGE_KEY)).toBe(false);
  });

  it("survives blocked or full storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadSaved(broken)).toBeNull();
    expect(saveState(sample, broken)).toBe(false);
    expect(() => clearSaved(broken)).not.toThrow();
  });
});
