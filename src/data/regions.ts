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
  /** What this part of the body does, in plain words. */
  bodyFunction: string;
  /** Why the crew checks it in space. */
  whyCheck: string;
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
    bodyFunction:
      "The brain runs mood, attention, memory and sleep. Together they decide how well a crew member thinks and works under pressure.",
    whyCheck:
      "Low mood or short sleep can creep in over weeks of confinement. A quick daily check-in catches the trend before it affects safety-critical work.",
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
    bodyFunction:
      "The eyes and the optic nerve turn light into the signals the brain reads as vision.",
    whyCheck:
      "Fluid shifting toward the head in weightlessness can change vision over weeks. A weekly self-check spots changes early so the medical team can decide on an eye exam.",
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
    bodyFunction:
      "The inner ear senses head movement and gravity, which keeps balance and tells the brain which way is up.",
    whyCheck:
      "Without gravity the balance system has to adapt, causing space sickness at first and unsteadiness after landing. A short questionnaire tracks how well it is adjusting.",
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
    bodyFunction:
      "The heart pumps blood through the vessels, carrying oxygen and fuel to every organ. Blood pressure and heart rate show how hard it is working.",
    whyCheck:
      "Fluid shifts and less physical load change the heart and vessels in space, and blood sugar control can drift. Comparing readings with your own baseline shows a change early.",
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
    bodyFunction:
      "The immune system finds and fights infections, and keeps dormant viruses in check.",
    whyCheck:
      "Stress, poor sleep and radiation can weaken it, and dormant viruses reactivated in many astronauts. A saliva check on board flags changes for Earth to follow up.",
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
    bodyFunction:
      "Not an organ: this tracks the whole-body radiation dose, which adds up over the mission and affects many tissues.",
    whyCheck:
      "Outside the shelter of Earth’s magnetic field the dose builds faster, especially during solar events. Watching the running total keeps it under the career limit.",
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
    bodyFunction:
      "The digestive system turns food into energy and the vitamins and minerals the body needs to repair itself.",
    whyCheck:
      "Crews tire of the menu and can eat less, and some vitamins matter for eyes and bones. Logging meals and a weekly rating shows when intake slips.",
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
    bodyFunction:
      "Skin and core temperature control keep the body near 37 °C by sweating, shivering and moving blood to and from the surface.",
    whyCheck:
      "A raised temperature can mean infection or a warm cabin. In a sealed cabin, a crew member with a fever matters to everyone.",
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
      "Reduced loading in microgravity can weaken bones and muscles. Exercise is one countermeasure, but does not eliminate all loss.",
    bodyFunction:
      "Bones hold the body up and store minerals; muscles move it. Both are kept strong by the load of gravity.",
    whyCheck:
      "Without that load bones lose about 1 to 1.5% of their mineral a month and muscles shrink. Logging daily exercise shows whether the countermeasure is happening.",
    measuredInSpace: "Exercise and strength checks, depending on mission equipment. Workouts logged here are self-reported.",
    needsEarth: "Bone density imaging before and after flight.",
  },
];

export function getRegionMeta(id: RegionId): RegionMeta {
  return REGIONS.find((r) => r.id === id)!;
}

/** Simulated values for areas that have no rule yet. All data here is simulated. */
export const STATIC_READINGS = {
  ear: { status: "ok", headline: "Balance check: steady", detail: "Weekly check, 2 days ago" },
  immune: { status: "ok", headline: "Cortisol: in range", detail: "Viral flag: none" },
} as const;

/** Simulated dose accumulated before the 30 days in the history. */
export const SIMULATED_DOSE_BASE_MSV = 20;

/** Cabin CO2 comes from the history (see the "co2" series). The rest are fixed simulated values. */
export const SIMULATED_CABIN = {
  tempC: 22.4,
  pressureKPa: 101.3,
  noiseDb: 54,
};
