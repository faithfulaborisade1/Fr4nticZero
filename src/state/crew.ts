import { CREW, DEFAULT_CREW, isCrewId, type CrewId } from "../data/crew";
import type { Attachment } from "./attachments";
import type { CheckInEntry } from "./history";
import type { LedgerEntry } from "./ledger";

export interface MedicationEntry { id: string; name: string; status: "noted" | "taken" | "skipped"; note: string; atISO: string; updatedAtISO?: string; }
export interface WorkoutEntry { id: string; activity: string; minutes: number; atISO: string; }
export interface CrewRecord { checkIns: CheckInEntry[]; ledger: LedgerEntry[]; dismissed: Record<string, boolean>; pending: Record<string, Attachment[]>; medications: MedicationEntry[]; workouts?: WorkoutEntry[]; }
export interface CrewMessage { id: string; from: CrewId; text: string; atISO: string; }
export interface CrewAlert { id: string; from: CrewId; about: CrewId; to: CrewId | "all"; text: string; atISO: string; }
export interface CrewWorkspace { activeId: CrewId; records: Record<CrewId, CrewRecord>; messages: CrewMessage[]; alerts: CrewAlert[]; }
export type LegacyCrewRecord = Pick<CrewRecord, "checkIns" | "ledger" | "dismissed" | "pending">;
export const emptyRecord = (): CrewRecord => ({ checkIns: [], ledger: [], dismissed: {}, pending: {}, medications: [], workouts: [] });
export function createCrewWorkspace(legacy?: LegacyCrewRecord): CrewWorkspace {
  const records = Object.fromEntries(CREW.map((person) => [person.id, emptyRecord()])) as Record<CrewId, CrewRecord>;
  if (legacy) records[DEFAULT_CREW] = { ...legacy, medications: [], workouts: [] };
  return { activeId: DEFAULT_CREW, records, messages: [], alerts: [] };
}
export function validWorkspace(value: unknown): value is CrewWorkspace {
  const object = (item: unknown): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item);
  const text = (item: unknown): item is string => typeof item === "string";
  const dated = (item: unknown): item is string => text(item) && Number.isFinite(Date.parse(item));
  if (!object(value) || !isCrewId(value.activeId) || !object(value.records) || !Array.isArray(value.messages) || !Array.isArray(value.alerts)) return false;
  for (const { id } of CREW) {
    const record = value.records[id];
    if (!object(record) || !Array.isArray(record.checkIns) || !Array.isArray(record.ledger) || !Array.isArray(record.medications) || !object(record.dismissed) || !object(record.pending)) return false;
    if (!record.medications.every((entry: unknown) => object(entry) && text(entry.id) && text(entry.name) && text(entry.note) && dated(entry.atISO) && (entry.updatedAtISO === undefined || dated(entry.updatedAtISO)) && ["noted", "taken", "skipped"].includes(String(entry.status)))) return false;
    if (record.workouts !== undefined && (!Array.isArray(record.workouts) || !record.workouts.every((entry: unknown) => object(entry) && text(entry.id) && typeof entry.activity === "string" && ["Strength", "Cardio", "Mobility", "Other"].includes(entry.activity) && typeof entry.minutes === "number" && Number.isInteger(entry.minutes) && entry.minutes >= 1 && entry.minutes <= 720 && dated(entry.atISO)))) return false;
  }
  return value.messages.every((message: unknown) => object(message) && text(message.id) && isCrewId(message.from) && text(message.text) && dated(message.atISO)) &&
    value.alerts.every((alert: unknown) => object(alert) && text(alert.id) && isCrewId(alert.from) && isCrewId(alert.about) && (alert.to === "all" || isCrewId(alert.to)) && text(alert.text) && dated(alert.atISO));
}
/** Keep card and supply-step IDs distinct across crew while preserving old first-profile IDs. */
export function crewCardId(id: CrewId, cardId: string): string { return id === DEFAULT_CREW ? cardId : `${id}::${cardId}`; }
export function updateRecord(workspace: CrewWorkspace, id: CrewId, update: (record: CrewRecord) => CrewRecord): CrewWorkspace {
  return { ...workspace, records: { ...workspace.records, [id]: update(workspace.records[id]) } };
}
export function alertsFor(workspace: CrewWorkspace, id: CrewId): CrewAlert[] { return workspace.alerts.filter((alert) => alert.to === "all" || alert.to === id || alert.from === id); }
export function createLocalId(): string { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
