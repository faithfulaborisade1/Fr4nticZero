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

export function escalation(card: Pick<DecisionCard, "verdict" | "status">): Escalation {
  if (card.verdict === "crew_decides") {
    return {
      tier: "all",
      icon: "📣",
      word: "All crew alerted",
      text: "All crew are alerted, because Earth cannot reply in time.",
    };
  }
  if (card.status === "act") {
    return {
      tier: "buddy",
      icon: "🤝",
      word: "Buddy alerted",
      text: `${BUDDY_NAME} (your buddy, simulated) is alerted, as well as the medical team.`,
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
