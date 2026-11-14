import { describe, expect, it } from "vitest";
import { createClock, jumpToDay, nowISO } from "./clock";
import { createCrewWorkspace, updateRecord, validWorkspace } from "./crew";
import { workoutsToday } from "./workouts";

describe("crew workout tracking", () => {
  it("isolates workout logs between profiles and preserves older saves", () => {
    const original = createCrewWorkspace();
    const atISO = nowISO(createClock());
    const changed = updateRecord(original, "sam", (record) => ({ ...record, workouts: [...(record.workouts ?? []), { id: "1", activity: "Strength", minutes: 30, atISO }] }));
    expect(changed.records.sam.workouts).toHaveLength(1);
    expect(changed.records.alex.workouts).toEqual([]);
    expect(validWorkspace(changed)).toBe(true);
    const older = JSON.parse(JSON.stringify(original));
    for (const record of Object.values(older.records) as Array<Record<string, unknown>>) delete record.workouts;
    expect(validWorkspace(older)).toBe(true);
    expect(validWorkspace({ ...changed, records: { ...changed.records, sam: { ...changed.records.sam, workouts: [{ id: "bad", activity: "Strength", minutes: -5, atISO }] } } })).toBe(false);
  });
  it("counts workouts on the current mission day, excluding future entries", () => {
    const first = createClock();
    const day2 = jumpToDay(first, 1);
    const workouts = [
      { id: "1", activity: "Strength", minutes: 20, atISO: nowISO(first) },
      { id: "2", activity: "Cardio", minutes: 30, atISO: nowISO(day2) },
      { id: "3", activity: "Mobility", minutes: 10, atISO: nowISO({ ...day2, elapsedMin: day2.elapsedMin + 5 }) },
    ];
    expect(workoutsToday(workouts, first).map((entry) => entry.id)).toEqual(["1"]);
    expect(workoutsToday(workouts, day2).map((entry) => entry.id)).toEqual(["2"]);
    expect(workoutsToday(workouts, { ...day2, elapsedMin: day2.elapsedMin + 5 }).map((entry) => entry.id)).toEqual(["2", "3"]);
  });
});
