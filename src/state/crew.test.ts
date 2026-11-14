import { describe, expect, it } from "vitest";
import { CREW } from "../data/crew";
import { alertsFor, createCrewWorkspace, crewCardId, updateRecord, validWorkspace } from "./crew";
import { parseSaved, type SavedState } from "./persist";
import { ALL_WORKING } from "../data/devices";
import { initialSupplies, stepKey, takeStep } from "./supplies";

const time = "2026-12-08T08:00:00.000Z";
describe("simulated crew workspace", () => {
  it("migrates the existing single-person history only to the first profile", () => {
    const checkIns = [{ indicator: "bp_systolic", value: 150, atISO: time }];
    const crew = createCrewWorkspace({ checkIns, ledger: [], dismissed: { old: true }, pending: {} });
    expect(CREW).toHaveLength(6);
    expect(crew.records.alex.checkIns).toEqual(checkIns);
    for (const person of CREW.slice(1)) expect(crew.records[person.id].checkIns).toEqual([]);
  });
  it("keeps entries isolated across crew and preserves the other records", () => {
    const original = createCrewWorkspace();
    const updated = updateRecord(original, "sam", (record) => ({ ...record, medications: [{ id: "m", name: "Example", status: "taken", note: "", atISO: time }] }));
    expect(updated.records.sam.medications).toHaveLength(1);
    expect(updated.records.alex.medications).toHaveLength(0);
    expect(original.records.sam.medications).toHaveLength(0);
  });
  it("keeps holding-step identity distinct while preserving old Alex IDs", () => {
    expect(crewCardId("alex", "reading")).toBe("reading");
    const a = stepKey(crewCardId("alex", "reading"), 0);
    const b = stepKey(crewCardId("sam", "reading"), 0);
    const first = takeStep(initialSupplies(), a, { text: "Rest", crewMinutes: 2 }, 0);
    const second = takeStep(first, b, { text: "Rest", crewMinutes: 2 }, 0);
    expect(second.done[a]).toBe(true);
    expect(second.done[b]).toBe(true);
    expect(second.minutesByDay[0]).toBe(4);
  });
  it("routes local notices to the recipient, all crew, and the author", () => {
    const w = createCrewWorkspace();
    w.alerts = [{ id: "a", from: "alex", about: "noor", to: "sam", text: "Please check in", atISO: time }, { id: "b", from: "morgan", about: "morgan", to: "all", text: "Crew note", atISO: time }];
    expect(alertsFor(w, "sam").map((a) => a.id)).toEqual(["a", "b"]);
    expect(alertsFor(w, "alex").map((a) => a.id)).toEqual(["a", "b"]);
    expect(alertsFor(w, "noor").map((a) => a.id)).toEqual(["b"]);
  });
  it("round-trips the crew workspace and rejects malformed messages", () => {
    const crew = createCrewWorkspace();
    crew.activeId = "sam";
    crew.messages.push({ id: "msg", from: "sam", text: "Hello", atISO: time });
    const save: SavedState = { v: 1, scenarioId: "bp_spike", elapsedMin: 0, speed: 1, envId: "station", delaySec: 1320, blackout: false, hazard: "all", ledger: [], checkIns: [], dismissed: {}, supplies: initialSupplies(), devices: ALL_WORKING, pending: {}, crew };
    expect(parseSaved(JSON.stringify(save))?.crew).toEqual(crew);
    expect(validWorkspace({ ...crew, messages: [{ from: "not-a-person" }] })).toBe(false);
  });
});
