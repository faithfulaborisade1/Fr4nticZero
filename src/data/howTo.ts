/**
 * Animated how-to guides. General technique from public Earth-based guidance (the same
 * sources as the measurement guides), adapted with plain notes for weightlessness.
 * They are not flight-approved procedures.
 */
export type SceneId =
  | "bp-rest"
  | "bp-cuff"
  | "bp-inflate"
  | "bp-log"
  | "glu-wash"
  | "glu-strip"
  | "glu-prick"
  | "glu-touch"
  | "glu-log"
  | "hr-rest"
  | "hr-find"
  | "hr-count"
  | "hr-log"
  | "temp-wait"
  | "temp-cover"
  | "temp-tongue"
  | "temp-log";

export interface HowToStep {
  title: string;
  text: string;
  /** Optional note on doing this step in weightlessness. */
  space?: string;
  scene: SceneId;
}

export interface HowToGuide {
  indicator: string;
  title: string;
  minutes: number;
  steps: HowToStep[];
  source: { title: string; url: string };
}

export const HOW_TO: Record<string, HowToGuide> = {
  bp_systolic: {
    indicator: "bp_systolic",
    title: "Measure blood pressure",
    minutes: 8,
    steps: [
      {
        title: "Rest quietly for five minutes",
        text: "Stay still and quiet for five minutes before you measure. No exercise, caffeine or talking just before.",
        space: "In weightlessness, hold yourself steady with a foot loop or handrail.",
        scene: "bp-rest",
      },
      {
        title: "Wrap the cuff on your bare upper arm",
        text: "Wrap it snugly, with the lower edge just above the bend of the elbow and the cuff level with your heart.",
        space: "Use the same arm and position every time so readings compare.",
        scene: "bp-cuff",
      },
      {
        title: "Press start and stay still",
        text: "Keep the arm relaxed and don’t talk while the cuff inflates and slowly releases.",
        scene: "bp-inflate",
      },
      {
        title: "Repeat once, then log it",
        text: "Take a second reading about a minute later. Log the systolic value (the first number) and the time.",
        scene: "bp-log",
      },
    ],
    source: {
      title: "American Heart Association · monitoring blood pressure at home",
      url: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home",
    },
  },
  glucose: {
    indicator: "glucose",
    title: "Measure blood sugar",
    minutes: 4,
    steps: [
      {
        title: "Wash and dry your hands",
        text: "Clean, dry hands stop sugar or water on the skin from skewing the result.",
        space: "In weightlessness, use the mission’s no-rinse wipes and dry fully.",
        scene: "glu-wash",
      },
      {
        title: "Insert a fresh test strip",
        text: "Use an unexpired strip made for this meter. Inserting it usually turns the meter on.",
        scene: "glu-strip",
      },
      {
        title: "Prick the side of a fingertip",
        text: "Use a new lancet on the side of a fingertip, which hurts less than the pad.",
        space: "Without gravity the drop clings to the skin instead of falling. Let it form.",
        scene: "glu-prick",
      },
      {
        title: "Touch the strip to the drop",
        text: "Bring the strip’s edge to the drop and let it draw the blood in. Don’t smear it.",
        scene: "glu-touch",
      },
      {
        title: "Log the result and dispose safely",
        text: "Log the mg/dL value, the time and when you last ate. Put the lancet and strip in the sharps container.",
        space: "Sharps and blood must be contained in a closed cabin.",
        scene: "glu-log",
      },
    ],
    source: { title: "FDA · tips for using a blood glucose meter", url: "https://www.fda.gov/media/119150/download" },
  },
  hr: {
    indicator: "hr",
    title: "Measure heart rate",
    minutes: 4,
    steps: [
      {
        title: "Rest for a few minutes",
        text: "Stay still for a few minutes first, so you measure your resting heart rate.",
        space: "In weightlessness, hold yourself steady with a foot loop or handrail.",
        scene: "hr-rest",
      },
      {
        title: "Find the pulse on your wrist",
        text: "Place two fingers, not your thumb, lightly on the inside of your wrist below the thumb.",
        scene: "hr-find",
      },
      {
        title: "Count for 60 seconds",
        text: "Count every beat for a full minute. A wearable reading works too, if it is approved for the mission.",
        scene: "hr-count",
      },
      {
        title: "Log beats per minute",
        text: "Log the number and the time, and note that you were resting.",
        scene: "hr-log",
      },
    ],
    source: {
      title: "American Heart Association · all about heart rate (pulse)",
      url: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
    },
  },
  temp: {
    indicator: "temp",
    title: "Measure body temperature",
    minutes: 4,
    steps: [
      {
        title: "Wait after eating or drinking",
        text: "Wait 20 to 30 minutes after anything hot or cold to eat or drink, and longer after hard exercise.",
        scene: "temp-wait",
      },
      {
        title: "Clean it and fit a probe cover",
        text: "Wipe the thermometer and slide on a fresh probe cover from the kit.",
        scene: "temp-cover",
      },
      {
        title: "Place it under your tongue",
        text: "Put the tip under your tongue, to one side. Close your lips and breathe through your nose.",
        scene: "temp-tongue",
      },
      {
        title: "Wait for the beep, then log",
        text: "Keep still until it beeps. Log the value in °C and the time.",
        space: "Bag the used cover straight away: nothing should float free in the cabin.",
        scene: "temp-log",
      },
    ],
    source: { title: "MedlinePlus · body temperature measurement", url: "https://medlineplus.gov/ency/article/003400.htm" },
  },
};

/** Which guide teaches the step a device is used for. */
export const DEVICE_HOW_TO: Record<string, string> = {
  bp_cuff: "bp_systolic",
  glucose_meter: "glucose",
  thermometer: "temp",
};
