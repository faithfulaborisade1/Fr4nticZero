import type { Environment, Source } from "../engine/types";

export interface MissionRisk {
  id: string;
  title: string;
  watch: string;
  reduce: string;
  response: string;
  sources: Source[];
}
export interface MissionRiskProfile { label: string; focus: string; risks: MissionRisk[] }

const sources = {
  radiation: { title: "NASA · Space radiation", url: "https://www.nasa.gov/hrp/hazard-space-radiation/" },
  protection: { title: "NASA · Radiation protection", url: "https://srag.jsc.nasa.gov/spaceradiation/how/how.cfm" },
  gravity: { title: "NASA · Gravity fields", url: "https://www.nasa.gov/hrp/hazard-gravity-fields/" },
  isolation: { title: "NASA · Isolation and confinement", url: "https://www.nasa.gov/hrp/hazard-isolation-and-confinement/" },
  cabin: { title: "NASA · Closed environments", url: "https://www.nasa.gov/hrp/hazard-hostile-closed-environments/" },
  distance: { title: "NASA · Distance from Earth", url: "https://www.nasa.gov/hrp/hazard-distance-from-earth/" },
  dust: { title: "NASA · Celestial dust exposure", url: "https://www.nasa.gov/directorates/esdmd/hhp/risk-of-adverse-health-performance-effects-of-celestial-dust-exposure/" },
};

const radiation: MissionRisk = {
  id: "radiation", title: "Radiation and space weather",
  watch: "Space radiation is invisible; exposure depends on location, time and shielding. Solar particle events can change the environment.",
  reduce: "Plan activities around mission radiation monitoring and shielding guidance, including spacewalk plans.",
  response: "Follow the mission's space-weather response plan and crew instructions, including shelter or changes to a spacewalk when directed.",
  sources: [sources.radiation, sources.protection],
};
const gravity: MissionRisk = {
  id: "gravity", title: "Changing gravity and physical function",
  watch: "Changes in gravity affect muscles, bones, balance and other body systems; transitions can make movement harder.",
  reduce: "Follow the mission's exercise and monitoring plan and prepare for transitions between gravity environments.",
  response: "Report changes in movement, balance or physical function to the crew and medical team; follow the mission's procedures.",
  sources: [sources.gravity],
};
const cabin: MissionRisk = {
  id: "environment", title: "Cabin air and life support",
  watch: "A closed habitat depends on controlled air quality, temperature, pressure and functioning life-support equipment.",
  reduce: "Follow scheduled environmental checks and maintenance procedures, and keep the crew aware of equipment issues.",
  response: "Follow the vehicle's environmental emergency procedures, notify the crew and report equipment or health concerns to mission control.",
  sources: [sources.cabin],
};
const isolation: MissionRisk = {
  id: "isolation", title: "Isolation, sleep and crew wellbeing",
  watch: "Confinement and long periods away from home can affect sleep, mood and team performance.",
  reduce: "Protect scheduled sleep, make time for communication and support regular crew check-ins.",
  response: "Raise concerns with a trusted crewmate or the medical and behavioral health team, and follow the mission's support plan.",
  sources: [sources.isolation],
};
const dust: MissionRisk = {
  id: "dust", title: "Lunar dust exposure",
  watch: "Lunar dust may affect the eyes, skin and respiratory system, and may enter the habitat on equipment.",
  reduce: "Follow the mission's suit, equipment and habitat dust-control procedures after surface activities.",
  response: "Report suspected exposure or symptoms and follow mission dust-containment and medical procedures.",
  sources: [sources.dust],
};
const distance: MissionRisk = {
  id: "distance", title: "Delayed help and limited resupply",
  watch: "Long distances can delay communication, resupply and medical support; the available response depends on the mission.",
  reduce: "Review onboard medical procedures, crew roles and available supplies before they are needed.",
  response: "Notify the crew, use the mission's approved onboard procedures and contact ground support when available.",
  sources: [sources.distance],
};

export const MISSION_RISKS: Record<Environment["id"], MissionRiskProfile> = {
  station: { label: "Space station", focus: "Living in microgravity and maintaining a safe closed habitat are ongoing considerations in low Earth orbit.", risks: [gravity, cabin, isolation, radiation] },
  moon: { label: "Moon surface", focus: "Surface activity adds lunar dust and gravity transitions to the challenges of a deep-space environment.", risks: [dust, radiation, gravity, cabin] },
  mars: { label: "Mars transit", focus: "A long transit combines radiation exposure, confinement, microgravity and delayed support from Earth.", risks: [radiation, distance, isolation, gravity, cabin] },
};
