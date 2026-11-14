import type { DecisionCard } from "./types";

/**
 * Who gets alerted, following the team's buddy-system notes. All tiers are DEMO rules.
 *  - self: a watch-level reading. Top up, re-check, log.
 *  - buddy: an act-level reading. The paired buddy is alerted as well as the medical team.
 *  - all: the crew must decide because Earth cannot reply in time. Every crew member is alerted.
 */
export type AlertTier = "self" | "buddy" | "all";

/** Simulated crewmate paired with the crew member. */
export const BUDDY_NAME = "Sam";

export interface Escalation {
  tier: AlertTier;
  icon: string;
  word: string;
  text: string;
}

export function escalation(card: Pick<DecisionCard, "verdict" | "status">, buddyName = BUDDY_NAME): Escalation {
  if (card.verdict === "crew_decides") {
    return {
      tier: "all",
      icon: "📣",
      word: "All-crew alert tier",
      text: "In this demo, all crew would be alerted because Earth cannot reply in time. No alert is sent.",
    };
  }
  if (card.status === "act") {
    return {
      tier: "buddy",
      icon: "🤝",
      word: "Buddy alert tier",
      text: `In this demo, ${buddyName} and the medical team would be alerted. No alert is sent.`,
    };
  }
  return {
    tier: "self",
    icon: "🙋",
    word: "Self top-up",
    text: "You: top up, re-check and log. No one else is alerted yet.",
  };
}

export const ALL_CLEAR_TEXT = "Good job, staying healthy. Everything is near your own baseline.";
