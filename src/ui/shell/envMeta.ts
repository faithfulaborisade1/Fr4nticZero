import { CarFront, Moon, Orbit, Satellite, type LucideIcon } from "lucide-react";
import type { Environment } from "../../engine/types";

/** Display names for each simulated environment. Mission names are fictional. */
export const ENV_META: Record<
  Environment["id"],
  { label: string; mission: string; icon: LucideIcon }
> = {
  station: { label: "Space station", mission: "Orbital ops · LEO", icon: Satellite },
  moon: { label: "Moon surface", mission: "Lunar surface ops", icon: Moon },
  rover: { label: "Lunar rover", mission: "Lunar rover traverse", icon: CarFront },
  mars: { label: "Mars transit", mission: "Mars transit", icon: Orbit },
};

export function formatDelay(sec: number): string {
  if (sec < 60) return `${Math.round(sec)} s`;
  const m = sec / 60;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} min`;
}
