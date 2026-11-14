import { KIT } from "../data/kit";
import { PANTRY, type PantryItem } from "../data/pantry";
import type { Step } from "../engine/types";

/** Kit and pantry stock plus the crew-time tally. Taking a step uses stock and adds minutes. */
export interface Supplies {
  kit: Record<string, number>;
  pantry: PantryItem[];
  /** Crew minutes spent, by mission day index. */
  minutesByDay: Record<number, number>;
  /** Steps already taken, keyed by stepKey. */
  done: Record<string, boolean>;
}

export function initialSupplies(): Supplies {
  return {
    kit: Object.fromEntries(KIT.map((k) => [k.id, k.qty])),
    pantry: PANTRY.map((p) => ({ ...p })),
    minutesByDay: {},
    done: {},
  };
}

export function stepKey(cardId: string, index: number): string {
  return `${cardId}#${index}`;
}

/** The first item the step needs that is not in stock, or null if everything is available. */
export function missingItem(s: Supplies, step: Step): string | null {
  for (const u of step.uses ?? []) {
    if ((s.kit[u.item] ?? 0) < u.qty) return u.item;
  }
  return null;
}

export function takeStep(s: Supplies, key: string, step: Step, day: number): Supplies {
  if (s.done[key] || missingItem(s, step) !== null) return s;
  const kit = { ...s.kit };
  for (const u of step.uses ?? []) kit[u.item] -= u.qty;
  return {
    ...s,
    kit,
    done: { ...s.done, [key]: true },
    minutesByDay: { ...s.minutesByDay, [day]: (s.minutesByDay[day] ?? 0) + step.crewMinutes },
  };
}

/** Eat a pantry meal: one fewer in stock, and it counts as eaten today. */
export function eatMeal(s: Supplies, id: string): Supplies {
  return {
    ...s,
    pantry: s.pantry.map((p) =>
      p.id === id && p.qty > 0 ? { ...p, qty: p.qty - 1, daysSinceEaten: 0 } : p,
    ),
  };
}

export function minutesToday(s: Supplies, day: number): number {
  return s.minutesByDay[day] ?? 0;
}
