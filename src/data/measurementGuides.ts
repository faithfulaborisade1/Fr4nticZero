export interface MeasurementGuide { label: string; unit: string; steps: string[]; source: string; sourceUrl: string }

/** Public Earth-based references are examples, not flight-qualified procedures. */
export const MEASUREMENT_GUIDES: Record<string, MeasurementGuide> = {
  bp_systolic: {
    label: "Blood pressure", unit: "mmHg", steps: ["Use the cuff and follow its instructions and the mission's measurement protocol.", "For Earth-based home measurement, the American Heart Association recommends resting quietly for five minutes and supporting the arm at heart level.", "Record the systolic value (the first number), the time and any relevant context."],
    source: "American Heart Association · blood pressure", sourceUrl: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home",
  },
  hr: {
    label: "Heart rate", unit: "bpm", steps: ["Follow the approved method for your wearable or other device.", "For a manual wrist pulse, lightly place two fingers on the inner wrist and count beats for 60 seconds.", "Record the beats per minute and note whether you were resting or active."],
    source: "American Heart Association · pulse", sourceUrl: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
  },
  glucose: {
    label: "Blood sugar", unit: "mg/dL", steps: ["Follow the mission-approved meter, sampling and infection-control instructions.", "The FDA advises washing hands and using a compatible, unexpired test strip; follow the device instructions for the sample.", "Record the displayed result and the time, with meal or activity context when relevant."],
    source: "FDA · glucose meter tips", sourceUrl: "https://www.fda.gov/media/119150/download",
  },
  temp: {
    label: "Body temperature", unit: "°C", steps: ["Use the approved thermometer and follow its instructions for the measurement site.", "Wait for the device to indicate the measurement is complete; record the site and result.", "Enter the value in °C, matching the unit shown in the form."],
    source: "MedlinePlus · temperature measurement", sourceUrl: "https://medlineplus.gov/ency/article/003400.htm",
  },
  sleep: {
    label: "Sleep", unit: "hours", steps: ["Record the approximate time actually spent asleep during your most recent sleep period.", "Enter hours as a decimal (for example, 6.5 means six and a half hours).", "Add context about disruptions separately if the mission protocol asks for it."],
    source: "NASA · isolation and confinement", sourceUrl: "https://www.nasa.gov/hrp/hazard-isolation-and-confinement/",
  },
  mood: {
    label: "Mood", unit: "1–5", steps: ["Reflect on how you feel and select a number from 1 (low) to 5 (great).", "This is a simple demo self-report, not a mental-health assessment.", "Use the mission's support channels if you want to discuss a concern."],
    source: "NASA · isolation and confinement", sourceUrl: "https://www.nasa.gov/hrp/hazard-isolation-and-confinement/",
  },
};
