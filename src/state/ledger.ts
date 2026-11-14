import { escalation, type AlertTier } from "../engine/escalation";
import type { Attachment } from "./attachments";
import type { DecisionCard, Environment, Rule, Status, Verdict } from "../engine/types";

/**
 * Decision ledger. Each logged decision travels to Earth, so it shows as "queued"
 * until one one-way delay has passed on the mission clock. A flight-surgeon review
 * travels back with another one-way delay. In a comms blackout both legs are held
 * until the link returns.
 */
export interface LedgerEntry {
  /** Same as the decision card id. */
  id: string;
  ruleId: string;
  indicator: string;
  value: number;
  verdict: Verdict;
  status: Exclude<Status, "ok">;
  crewChoice: string;
  /** Simulated alert tier recorded when this was logged; no notification is sent. */
  alert: AlertTier;
  /** Photos or scans sent with the entry. Not analysed. Arrive with the entry. */
  attachments: Attachment[];
  envId: Environment["id"];
  oneWayDelaySec: number;
  loggedAtISO: string;
  /** When the entry reaches Earth. null while held by a blackout. */
  deliverAtISO: string | null;
  surgeonReview?: "concur" | "overrule";
  reviewedAtISO?: string;
  /** When the review reaches the crew. null while held by a blackout. */
  reviewArrivesISO?: string | null;
}

export type LinkState = "queued" | "held" | "delivered";
export type ReviewState = "none" | "in_transit" | "held" | "received";

function addSec(iso: string, sec: number): string {
  return new Date(new Date(iso).getTime() + sec * 1000).toISOString();
}

const ms = (iso: string) => new Date(iso).getTime();

export function createEntry(
  card: DecisionCard,
  rule: Rule,
  crewChoice: string,
  env: Environment,
  nowISO: string,
  attachments: Attachment[] = [],
): LedgerEntry {
  return {
    id: card.id,
    ruleId: rule.id,
    indicator: rule.indicator,
    value: card.value,
    verdict: card.verdict,
    status: card.status,
    crewChoice,
    alert: escalation(card).tier,
    attachments,
    envId: env.id,
    oneWayDelaySec: env.oneWayDelaySec,
    loggedAtISO: nowISO,
    deliverAtISO: env.blackout ? null : addSec(nowISO, env.oneWayDelaySec),
  };
}

export function linkState(e: LedgerEntry, nowISO: string): LinkState {
  if (e.deliverAtISO === null) return "held";
  return ms(nowISO) >= ms(e.deliverAtISO) ? "delivered" : "queued";
}

export function reviewState(e: LedgerEntry, nowISO: string): ReviewState {
  if (!e.surgeonReview) return "none";
  if (e.reviewArrivesISO === null || e.reviewArrivesISO === undefined) return "held";
  return ms(nowISO) >= ms(e.reviewArrivesISO) ? "received" : "in_transit";
}

/** The surgeon can only review what has reached Earth. */
export function canReview(e: LedgerEntry, nowISO: string): boolean {
  return !e.surgeonReview && linkState(e, nowISO) === "delivered";
}

export function addEntry(entries: LedgerEntry[], entry: LedgerEntry): LedgerEntry[] {
  if (entries.some((e) => e.id === entry.id)) return entries;
  return [...entries, entry];
}

export function reviewEntry(
  entries: LedgerEntry[],
  id: string,
  review: "concur" | "overrule",
  env: Environment,
  nowISO: string,
): LedgerEntry[] {
  return entries.map((e) =>
    e.id === id && canReview(e, nowISO)
      ? {
          ...e,
          surgeonReview: review,
          reviewedAtISO: nowISO,
          reviewArrivesISO: env.blackout ? null : addSec(nowISO, env.oneWayDelaySec),
        }
      : e,
  );
}

/** The link is back: release anything a blackout was holding. */
export function releaseHeld(
  entries: LedgerEntry[],
  env: Environment,
  nowISO: string,
): LedgerEntry[] {
  if (env.blackout) return entries;
  return entries.map((e) => {
    let next = e;
    if (e.deliverAtISO === null) {
      next = { ...next, deliverAtISO: addSec(nowISO, env.oneWayDelaySec) };
    }
    if (e.surgeonReview && e.reviewArrivesISO === null) {
      next = { ...next, reviewArrivesISO: addSec(nowISO, env.oneWayDelaySec) };
    }
    return next;
  });
}

/** Seconds until the next arrival for this entry, or null if nothing is in transit. */
export function secondsToArrival(e: LedgerEntry, nowISO: string): number | null {
  const state = linkState(e, nowISO);
  if (state === "queued") return (ms(e.deliverAtISO!) - ms(nowISO)) / 1000;
  if (reviewState(e, nowISO) === "in_transit") {
    return (ms(e.reviewArrivesISO!) - ms(nowISO)) / 1000;
  }
  return null;
}
