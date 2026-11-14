import type { Hazard } from "../engine/types";

export type RegionId =
  | "heart"
  | "head"
  | "eyes"
  | "stomach"
  | "immune"
  | "bones"
  | "ear"
  | "skin"
  | "radiation";

export interface RegionMeta {
  id: RegionId;
  label: string;
  icon: string;
  hazard: Hazard;
  side: "left" | "right";
  depth: "deep" | "medium" | "shallow";
  explanation: string;
  measuredInSpace: string;
  needsEarth: string;
}

export const REGIONS: RegionMeta[] = [
  {
    id: "head",
    label: "Head (mind)",
    icon: "🧠",
    hazard: "isolation",
    side: "left",
    depth: "deep",
    explanation:
      "Isolation, confinement and short sleep can pull mood down over weeks. A short daily check-in shows the trend early.",
    measuredInSpace: "One-tap mood check-in and sleep log.",
    needsEarth: "A conversation with a ground psychologist.",
  },
  {
    id: "eyes",
    label: "Eyes",
    icon: "👁",
    hazard: "gravity",
    side: "left",
    depth: "deep",
    explanation:
      "Fluid shifts toward the head in microgravity can change vision over weeks. About 70% of long-duration crew show signs.",
    measuredInSpace: "Vision self-check, headaches, head fullness, blood pressure.",
    needsEarth: "Spinal fluid sampling and detailed eye imaging.",
  },
  {
    id: "ear",
    label: "Inner ear (balance)",
    icon: "👂",
    hazard: "gravity",
    side: "left",
    depth: "shallow",
    explanation:
      "Without gravity the brain has to relearn orientation, which can cause space sickness in the first days.",
    measuredInSpace: "Balance and space-sickness questionnaire.",
    needsEarth: "Specialist balance testing.",
  },
  {
    id: "heart",
    label: "Heart",
    icon: "❤️",
    hazard: "gravity",
    side: "left",
    depth: "deep",
    explanation:
      "Blood shifts upward in microgravity, vessels can stiffen and insulin resistance can develop, so heart rate, blood pressure and blood sugar are tracked together.",
    measuredInSpace: "Cuff blood pressure, heart rate and finger-prick glucose.",
    needsEarth: "ECG review and imaging of the heart and vessels.",
  },
  {
    id: "immune",
    label: "Immune (blood)",
    icon: "🩸",
    hazard: "radiation",
    side: "left",
    depth: "shallow",
    explanation:
      "Stress and radiation can change immune function. Dormant viruses reactivated in many ISS astronauts. This link is under investigation.",
    measuredInSpace: "Saliva strip for cortisol and a viral-reactivation flag.",
    needsEarth: "Blood immune-cell counts at a ground lab.",
  },
  {
    id: "radiation",
    label: "Whole body (radiation)",
    icon: "☢️",
    hazard: "radiation",
    side: "right",
    depth: "shallow",
    explanation:
      "Space radiation adds up over a mission. The career limit is under 600 mSv, and 250 mSv per solar particle event.",
    measuredInSpace:
      "Dose readings from an onboard neutron dosimeter, modelled on instruments such as CSA's CANS.",
    needsEarth: "Biological dosimetry and long-term health follow-up.",
  },
  {
    id: "stomach",
    label: "Stomach (nutrition)",
    icon: "🍽",
    hazard: "distance",
    side: "right",
    depth: "medium",
    explanation:
      "On long missions crew can tire of the menu and eat less. Meals eaten, vitamin intake and body mass are logged together.",
    measuredInSpace: "Meal tick list, weekly meal survey, body mass.",
    needsEarth: "Blood nutrient panels.",
  },
  {
    id: "skin",
    label: "Skin / core",
    icon: "🌡",
    hazard: "environment",
    side: "right",
    depth: "shallow",
    explanation:
      "Core temperature can drift with cabin conditions, exercise or illness.",
    measuredInSpace: "Thermometer or wearable.",
    needsEarth: "Blood tests for infection markers.",
  },
  {
    id: "bones",
    label: "Bones and muscles",
    icon: "🦴",
    hazard: "gravity",
    side: "right",
    depth: "shallow",
    explanation:
      "Without gravity bones lose about 1 to 1.5% mineral per month and muscles shrink unless crew exercise every day.",
    measuredInSpace: "Exercise log against plan, estimated bone loss.",
    needsEarth: "Bone density scans.",
  },
];

export function getRegionMeta(id: RegionId): RegionMeta {
  return REGIONS.find((r) => r.id === id)!;
}

/** Simulated values for areas that have no rule yet. All data here is simulated. */
export const STATIC_READINGS = {
  ear: { status: "ok", headline: "Balance check: steady", detail: "Weekly check, 2 days ago" },
  immune: { status: "ok", headline: "Cortisol: in range", detail: "Viral flag: none" },
  bones: { status: "watch", headline: "Exercise 1 of 2 sessions", detail: "Bone loss estimate: low" },
} as const;

/** Simulated dose accumulated before the 30 days in the history. */
export const SIMULATED_DOSE_BASE_MSV = 20;

/** Cabin CO2 comes from the history (see the "co2" series). The rest are fixed simulated values. */
export const SIMULATED_CABIN = {
  tempC: 22.4,
  pressureKPa: 101.3,
  noiseDb: 54,
};
