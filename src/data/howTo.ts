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
  | "glu-log";

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
};

/** Which guide teaches the step a device is used for. */
export const DEVICE_HOW_TO: Record<string, string> = {
  bp_cuff: "bp_systolic",
  glucose_meter: "glucose",
};
