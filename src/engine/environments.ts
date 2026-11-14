import type { Environment } from "./types";

// Delay figures are approximate and come from the NASA sources listed in HANDOFF.md section 7.
export const STATION_DELAY_SEC = 1;
export const MOON_DELAY_RANGE_SEC = [3, 14] as const;
export const MARS_DELAY_MAX_SEC = 22 * 60;

export function makeEnvironment(
  id: Environment["id"],
  oneWayDelaySec?: number,
  blackout = false,
): Environment {
  switch (id) {
    case "station":
      return { id, oneWayDelaySec: STATION_DELAY_SEC, blackout };
    case "moon":
      return {
        id,
        oneWayDelaySec: clamp(oneWayDelaySec ?? 8, ...MOON_DELAY_RANGE_SEC),
        blackout,
      };
    case "rover":
      // A lunar rover talks to Earth through the same relays as the surface base.
      return {
        id,
        oneWayDelaySec: clamp(oneWayDelaySec ?? 8, ...MOON_DELAY_RANGE_SEC),
        blackout,
      };
    case "mars":
      return {
        id,
        oneWayDelaySec: clamp(oneWayDelaySec ?? MARS_DELAY_MAX_SEC, 0, MARS_DELAY_MAX_SEC),
        blackout,
      };
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
