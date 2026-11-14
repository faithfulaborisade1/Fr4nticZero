import type { History } from "../data/generator";
import { MINUTES_PER_DAY } from "./clock";

export interface CheckInEntry {
  indicator: string;
  value: number;
  atISO: string;
}

/** Only the days up to and including `dayIndex` (0-based) have happened. */
export function visibleHistory(full: History, dayIndex: number): History {
  const out: History = {};
  for (const [k, v] of Object.entries(full)) out[k] = v.slice(0, Math.max(0, dayIndex) + 1);
  return out;
}

/** Crew check-ins are appended after the generated days. */
export function appendCheckIns(h: History, entries: CheckInEntry[]): History {
  if (entries.length === 0) return h;
  const out: History = {};
  for (const [k, v] of Object.entries(h)) out[k] = [...v];
  for (const e of entries) (out[e.indicator] ??= []).push(e.value);
  return out;
}

export function dayStartISO(startISO: string, dayIndex: number): string {
  return new Date(
    new Date(startISO).getTime() + dayIndex * MINUTES_PER_DAY * 60_000,
  ).toISOString();
}

/** When the latest reading of an indicator was taken: its latest check-in, else the start of the last visible day. */
export function readingTimeFor(
  indicator: string,
  startISO: string,
  visibleDays: number,
  checkIns: CheckInEntry[],
): string {
  for (let i = checkIns.length - 1; i >= 0; i--) {
    if (checkIns[i].indicator === indicator) return checkIns[i].atISO;
  }
  return dayStartISO(startISO, Math.max(0, visibleDays - 1));
}
