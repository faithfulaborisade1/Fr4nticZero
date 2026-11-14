import type { DeviceState } from "../data/devices";
import { ALL_WORKING } from "../data/devices";
import type { HazardFilter } from "../data/hazards";
import { SCENARIOS } from "../data/scenarios";
import type { Environment } from "../engine/types";
import type { Attachment } from "./attachments";
import type { CheckInEntry } from "./history";
import type { LedgerEntry } from "./ledger";
import type { Supplies } from "./supplies";
import { validWorkspace, type CrewWorkspace } from "./crew";

/**
 * Everything the crew has done in the app is kept in this browser (local storage) so a
 * reload does not lose it. The mission clock is saved as elapsed minutes and always
 * comes back paused. Nothing leaves the device.
 */
export interface SavedState {
  v: 1;
  /** Optional crew workspace; older single-person saves migrate to Alex. */
  crew?: CrewWorkspace;
  scenarioId: string;
  elapsedMin: number;
  speed: number;
  envId: Environment["id"];
  delaySec: number;
  blackout: boolean;
  hazard: HazardFilter;
  ledger: LedgerEntry[];
  checkIns: CheckInEntry[];
  dismissed: Record<string, boolean>;
  supplies: Supplies;
  /** Which equipment is working (true) or has failed (false). */
  devices: DeviceState;
  /** Images chosen on a decision card but not yet logged, by card id. */
  pending: Record<string, Attachment[]>;
}

export const STORAGE_KEY = "decision-window-v1";

const ENVS = ["station", "moon", "mars"];
const HAZARDS = ["all", "radiation", "isolation", "distance", "gravity", "environment"];

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Parse saved text. Returns null for anything missing, corrupt or from another version. */
export function parseSaved(text: string | null): SavedState | null {
  if (!text) return null;
  try {
    const d: unknown = JSON.parse(text);
    if (!isObj(d) || d.v !== 1) return null;
    if (typeof d.scenarioId !== "string" || !SCENARIOS.some((s) => s.id === d.scenarioId)) return null;
    if (!isNum(d.elapsedMin) || d.elapsedMin < 0 || !isNum(d.speed) || d.speed <= 0) return null;
    if (typeof d.envId !== "string" || !ENVS.includes(d.envId)) return null;
    if (!isNum(d.delaySec) || typeof d.blackout !== "boolean") return null;
    if (typeof d.hazard !== "string" || !HAZARDS.includes(d.hazard)) return null;
    if (!Array.isArray(d.ledger) || !Array.isArray(d.checkIns) || !isObj(d.dismissed)) return null;
    const s = d.supplies;
    if (!isObj(s) || !isObj(s.kit) || !Array.isArray(s.pantry) || !isObj(s.minutesByDay) || !isObj(s.done)) {
      return null;
    }
    // Older saves do not have these two fields.
    if (d.devices !== undefined && !isObj(d.devices)) return null;
    if (d.pending !== undefined && !isObj(d.pending)) return null;
    if (d.crew !== undefined && !validWorkspace(d.crew)) return null;
    const saved = d as unknown as SavedState;
    return {
      ...saved,
      devices: { ...ALL_WORKING, ...((d.devices as DeviceState | undefined) ?? {}) },
      pending: (d.pending as Record<string, Attachment[]> | undefined) ?? {},
      // Ledger entries saved before image attach have no attachments.
      ledger: saved.ledger.map((e) => ({ ...e, attachments: e.attachments ?? [] })),
    };
  } catch {
    return null;
  }
}

function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadSaved(storage: Pick<Storage, "getItem"> | null = store()): SavedState | null {
  try {
    return parseSaved(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return null;
  }
}

export function saveState(
  state: SavedState,
  storage: Pick<Storage, "setItem"> | null = store(),
): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return !!storage;
  } catch {
    return false; // storage full or blocked: carry on without saving
  }
}

export function clearSaved(storage: Pick<Storage, "removeItem"> | null = store()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
