/** Pure mission clock. The UI drives it with a timer; tests drive it directly. */

export interface ClockState {
  /** ISO time of mission day 0, 08:00. */
  startISO: string;
  /** Minutes elapsed since start. */
  elapsedMin: number;
  playing: boolean;
  /** Mission minutes per real second while playing. */
  speed: number;
}

export const MINUTES_PER_DAY = 24 * 60;

export function createClock(
  startISO = "2026-11-14T08:00:00.000Z",
  speed = 30,
): ClockState {
  return { startISO, elapsedMin: 0, playing: false, speed };
}

export function nowISO(c: ClockState): string {
  return new Date(
    new Date(c.startISO).getTime() + c.elapsedMin * 60_000,
  ).toISOString();
}

export function missionDay(c: ClockState): number {
  return Math.floor(c.elapsedMin / MINUTES_PER_DAY);
}

export function tick(c: ClockState, realSeconds: number): ClockState {
  if (!c.playing) return c;
  return { ...c, elapsedMin: c.elapsedMin + realSeconds * c.speed };
}

export function play(c: ClockState): ClockState {
  return { ...c, playing: true };
}

export function pause(c: ClockState): ClockState {
  return { ...c, playing: false };
}

export function jumpToDay(c: ClockState, day: number): ClockState {
  return { ...c, elapsedMin: Math.max(0, day) * MINUTES_PER_DAY };
}
