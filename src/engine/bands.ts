import type { Source, Status } from "./types";

export const CO2_SOURCE: Source = {
  title: "NASA: CO2 on the ISS",
  url: "https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf",
};

/** ISS CO2 is held to a 4.0 mmHg daily average; symptoms are reported from 2.3 mmHg; headaches above about 3.0. */
export function co2Status(mmHg: number): Status {
  if (mmHg > 3.0) return "act";
  if (mmHg >= 2.3) return "watch";
  return "ok";
}

export const RADIATION_SOURCE: Source = {
  title: "NASA OCHMO radiation protection technical brief",
  url: "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
};

/** Career limit is under 600 mSv. */
export const CAREER_LIMIT_MSV = 600;
/** Limit per solar particle event. */
export const SPE_LIMIT_MSV = 250;

/** DEMO banding of cumulative dose as a fraction of the career limit. */
export function doseStatus(cumulativeMsv: number): Status {
  const f = cumulativeMsv / CAREER_LIMIT_MSV;
  if (f >= 0.8) return "act";
  if (f >= 0.5) return "watch";
  return "ok";
}
