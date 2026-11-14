/** Fictional crew for the local demonstration. No profile is a real research subject. */
export const CREW = [
  { id: "alex", name: "Alex Chen", role: "Mission commander", model: "male", seed: 2026, buddy: "sam" },
  { id: "sam", name: "Sam Rivera", role: "Medical officer", model: "female", seed: 2061, buddy: "alex" },
  { id: "noor", name: "Noor Patel", role: "Flight engineer", model: "female", seed: 2073, buddy: "morgan" },
  { id: "morgan", name: "Morgan Lee", role: "Science officer", model: "male", seed: 2089, buddy: "noor" },
  { id: "taylor", name: "Taylor Okafor", role: "Mission specialist", model: "female", seed: 2111, buddy: "jamie" },
  { id: "jamie", name: "Jamie Park", role: "Systems specialist", model: "male", seed: 2129, buddy: "taylor" },
] as const;
export type CrewId = (typeof CREW)[number]["id"];
export const DEFAULT_CREW: CrewId = "alex";
export function getCrew(id: string) { return CREW.find((person) => person.id === id) ?? CREW[0]; }
export function isCrewId(id: unknown): id is CrewId { return typeof id === "string" && CREW.some((person) => person.id === id); }
