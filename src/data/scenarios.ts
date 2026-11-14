import type { History } from "./generator";

export interface Scenario {
  id: string;
  name: string;
  blurb: string;
  apply: (h: History) => History;
}

function withLast(h: History, indicator: string, value: number): History {
  return { ...h, [indicator]: [...h[indicator].slice(0, -1), value] };
}

export const SCENARIOS: Scenario[] = [
  {
    id: "none",
    name: "No events",
    blurb: "Ordinary day. All readings sit near the crew member's own baseline.",
    apply: (h) => h,
  },
  {
    id: "bp_spike",
    name: "1. Blood pressure spike",
    blurb:
      "Systolic blood pressure jumps well above baseline. Drag Station to Mars and watch whose call it becomes.",
    apply: (h) => withLast(h, "bp_systolic", 146),
  },
];

export const DEFAULT_SCENARIO = "bp_spike";

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
