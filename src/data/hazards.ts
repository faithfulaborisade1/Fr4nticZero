import type { Hazard, Source } from "../engine/types";
import type { RegionId } from "./regions";

export interface HazardInfo {
  id: Hazard;
  label: string;
  blurb: string;
  /** Published figure that anchors a gauge or flag. To be confirmed at the link (see docs/RESEARCH.md). */
  figure: string;
  sources: Source[];
}

export const HAZARDS: HazardInfo[] = [
  {
    id: "radiation",
    label: "Radiation",
    blurb: "Space radiation adds up over a mission and can affect the immune system.",
    figure: "Career limit under 600 mSv; 250 mSv per solar particle event.",
    sources: [
      {
        title: "NASA OCHMO radiation protection brief",
        url: "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
      },
    ],
  },
  {
    id: "isolation",
    label: "Isolation",
    blurb: "Confinement and distance from home affect sleep, mood and the immune system.",
    figure:
      "8.5 h of sleep scheduled but about 6 h achieved on ISS missions. Herpes viruses were shed by 53% of shuttle and 61% of ISS astronauts.",
    sources: [
      {
        title: "Barger et al., Lancet Neurology 2014 (news release)",
        url: "https://www.eurekalert.org/news-releases/541449",
      },
      {
        title: "Report on Mehta et al. 2019 (viral reactivation)",
        url: "https://bigthink.com/surprising-science/herpes-astronauts",
      },
    ],
  },
  {
    id: "distance",
    label: "Distance",
    blurb: "The farther from Earth, the longer the wait for help. This sets whose call it is.",
    figure: "Mars: up to 22 min one way, 44 min round trip. Moon: 3 to 14 s one way.",
    sources: [
      {
        title: "NASA Human Health and Performance (Moon to Mars)",
        url: "https://ntrs.nasa.gov/api/citations/20230015521/downloads/Human%20Health%20and%20Performance.pdf",
      },
      {
        title: "NASA comms-delay review",
        url: "https://ntrs.nasa.gov/citations/20250000703",
      },
    ],
  },
  {
    id: "gravity",
    label: "Gravity",
    blurb: "Weightlessness shifts fluids, weakens bones and muscles and can change vision.",
    figure:
      "About 1 to 1.5% bone mineral loss per month without countermeasures. About 70% of long-duration crew show signs of SANS.",
    sources: [
      {
        title: "NASA OCHMO bone loss brief",
        url: "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-030-bone-loss.pdf",
      },
      {
        title: "NASA: Crewmember SANS overview",
        url: "https://ntrs.nasa.gov/api/citations/20230006218/downloads/Brunstetter%20-%20Crewmember%20SANS%20Overview%20-%20Export%20Control%20-FINAL%20-%2001May23.pdf",
      },
    ],
  },
  {
    id: "environment",
    label: "Environment",
    blurb: "A sealed cabin concentrates CO2, heat and noise, which can cause headaches and fatigue.",
    figure:
      "ISS CO2 is held to a 4.0 mmHg daily average. Symptoms are reported from 2.3 mmHg and headaches above about 3.0.",
    sources: [
      {
        title: "NASA: CO2 on the ISS",
        url: "https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf",
      },
    ],
  },
];

export function getHazard(id: Hazard): HazardInfo {
  return HAZARDS.find((h) => h.id === id)!;
}

/** Hazards that affect each body area. Stomach and immune have two, as in the build spec. */
export const REGION_HAZARDS: Record<RegionId, Hazard[]> = {
  heart: ["gravity"],
  head: ["isolation"],
  eyes: ["gravity"],
  ear: ["gravity"],
  stomach: ["distance", "isolation"],
  immune: ["radiation", "isolation"],
  bones: ["gravity"],
  skin: ["environment"],
  radiation: ["radiation"],
};

export type HazardFilter = Hazard | "all";

export function regionInHazard(id: RegionId, filter: HazardFilter): boolean {
  return filter === "all" || REGION_HAZARDS[id].includes(filter);
}
