import type { History } from "./generator";

export interface Scenario {
  id: string;
  name: string;
  blurb: string;
  /** Mission day index (0-based) the clock starts on when the scenario is chosen. */
  startDay: number;
  apply: (h: History) => History;
}

function withLast(h: History, indicator: string, value: number): History {
  return { ...h, [indicator]: [...h[indicator].slice(0, -1), value] };
}

/** Replace the final days of a series. */
function withTail(h: History, indicator: string, tail: number[]): History {
  const s = h[indicator];
  return { ...h, [indicator]: [...s.slice(0, s.length - tail.length), ...tail] };
}

export const SCENARIOS: Scenario[] = [
  {
    id: "none",
    name: "No events",
    blurb: "Ordinary day. All readings sit near the crew member's own baseline.",
    startDay: 29,
    apply: (h) => h,
  },
  {
    id: "bp_spike",
    name: "1. Blood pressure spike",
    blurb:
      "Systolic blood pressure jumps well above baseline. Drag Station to Mars and watch whose call it becomes.",
    startDay: 29,
    apply: (h) => withLast(h, "bp_systolic", 146),
  },
  {
    id: "bad_week",
    name: "2. Bad week",
    blurb:
      "Mood and sleep fall over five days while the radiation dose creeps up. Press Next day (or Play at the fastest speed) from day 25 and watch the nudge and the immune watch level appear.",
    startDay: 24,
    apply: (h) => {
      let out = withTail(h, "mood", [3, 3, 2, 2, 2]);
      out = withTail(out, "sleep", [5.2, 4.9, 4.6, 4.3, 4.1]);
      out = withTail(out, "dose_daily", [0.8, 0.9, 0.9, 1.0, 1.0]);
      return out;
    },
  },
];

export const DEFAULT_SCENARIO = "bp_spike";

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
