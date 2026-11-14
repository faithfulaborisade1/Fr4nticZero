import { deviationTest } from "./baseline";
import type { Rule } from "./types";

// Every threshold is a deviation from the crew member's own baseline and is a DEMO value.
// Every action window is a DEMO value. See HANDOFF.md section 7.

const SLEEP_SOURCE = {
  title: "Barger et al., Lancet Neurology 2014 (news release)",
  url: "https://www.eurekalert.org/news-releases/541449",
};

export const RULES: Rule[] = [
  {
    id: "bp_systolic_high",
    indicator: "bp_systolic",
    region: "heart",
    hazard: "gravity",
    test: deviationTest({ watchSd: 2, actSd: 3, direction: "high" }),
    actionWindowMin: 30,
    holdingSteps: [
      { text: "Sit or lie down and rest for 5 minutes.", crewMinutes: 5 },
      { text: "Re-measure blood pressure on the other arm.", crewMinutes: 3 },
      { text: "Drink a glass of water.", crewMinutes: 2 },
      { text: "Log symptoms and notify the medical team.", crewMinutes: 5 },
    ],
    explanation:
      "Blood pressure is well above your own baseline. Fluid shifts in microgravity can move it, so re-measure before acting.",
    measuredInSpace: "Cuff blood pressure on board.",
    needsEarth: "Imaging of the heart and vessels.",
    source: "DEMO",
    windowSource: "DEMO",
  },
  {
    id: "hr_high",
    indicator: "hr",
    region: "heart",
    hazard: "gravity",
    test: deviationTest({ watchSd: 2, actSd: 3, direction: "high" }),
    actionWindowMin: 20,
    holdingSteps: [
      { text: "Stop activity and rest.", crewMinutes: 5 },
      { text: "Re-measure heart rate after 5 minutes.", crewMinutes: 5 },
      { text: "Log symptoms and notify the medical team.", crewMinutes: 5 },
    ],
    explanation:
      "Resting heart rate is well above your own baseline. Re-check after resting.",
    measuredInSpace: "Wearable or cuff heart rate on board.",
    needsEarth: "Full ECG review by a cardiologist.",
    source: "DEMO",
    windowSource: "DEMO",
  },
  {
    id: "glucose_high",
    indicator: "glucose",
    region: "heart",
    hazard: "gravity",
    test: deviationTest({ watchSd: 2, actSd: 3, direction: "high" }),
    actionWindowMin: 45,
    holdingSteps: [
      { text: "Re-test blood sugar with a fresh strip.", crewMinutes: 3 },
      { text: "Log the last meal and activity.", crewMinutes: 3 },
      { text: "Notify the medical team.", crewMinutes: 3 },
    ],
    explanation:
      "Blood sugar is above your own baseline. Blood vessels stiffen and insulin resistance can develop in spaceflight.",
    measuredInSpace: "Finger-prick glucose meter on board.",
    needsEarth: "Lab panel (HbA1c, insulin).",
    source: "DEMO",
    windowSource: "DEMO",
    recheckMin: 60,
  },
  {
    id: "temp_high",
    indicator: "temp",
    region: "skin",
    hazard: "environment",
    test: deviationTest({ watchSd: 2, actSd: 3, direction: "high" }),
    actionWindowMin: 60,
    holdingSteps: [
      { text: "Re-measure body temperature.", crewMinutes: 2 },
      { text: "Rest and hydrate.", crewMinutes: 5 },
      { text: "Check cabin temperature and notify the medical team.", crewMinutes: 3 },
    ],
    explanation:
      "Body temperature is above your own baseline. Warm cabin air or illness can both cause this.",
    measuredInSpace: "Thermometer on board.",
    needsEarth: "Blood tests for infection markers.",
    source: "DEMO",
    windowSource: "DEMO",
  },
  {
    id: "sleep_short",
    indicator: "sleep",
    region: "head",
    hazard: "isolation",
    test: deviationTest({ watchSd: 1.5, actSd: 3, direction: "low" }),
    actionWindowMin: null,
    holdingSteps: [
      { text: "Keep a regular sleep window tonight.", crewMinutes: 0 },
      { text: "Log how rested you feel.", crewMinutes: 2 },
    ],
    explanation:
      "Crew on the ISS get about 6 hours against 8.5 scheduled. A run of short nights is worth watching.",
    measuredInSpace: "Wearable sleep log or self-report.",
    needsEarth: "Sleep-study analysis.",
    source: SLEEP_SOURCE,
    windowSource: "DEMO",
    recheckMin: 60 * 24,
  },
  {
    id: "mood_low",
    indicator: "mood",
    region: "head",
    hazard: "isolation",
    test: deviationTest({ watchSd: 1.5, actSd: 3, direction: "low" }),
    actionWindowMin: null,
    holdingSteps: [
      { text: "Call home or a crewmate.", crewMinutes: 15 },
      { text: "Join a crew activity.", crewMinutes: 30 },
    ],
    explanation:
      "Mood is below your own baseline. Isolation and distance from home can weigh on it.",
    measuredInSpace: "One-tap mood check-in (1 to 5).",
    needsEarth: "Conversation with a ground psychologist.",
    source: "DEMO",
    windowSource: "DEMO",
    recheckMin: 60 * 24,
  },
];

export function getRule(id: string): Rule | undefined {
  return RULES.find((r) => r.id === id);
}

export function rulesForIndicator(indicator: string): Rule[] {
  return RULES.filter((r) => r.indicator === indicator);
}
