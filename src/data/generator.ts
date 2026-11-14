/** Seeded generator for simulated crew history. All data it produces is simulated. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Approximately standard normal (Box-Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface IndicatorSpec {
  id: string;
  mean: number;
  sd: number;
  min: number;
  max: number;
  round: number;
}

export const INDICATORS: IndicatorSpec[] = [
  { id: "bp_systolic", mean: 118, sd: 3, min: 80, max: 220, round: 0 },
  { id: "hr", mean: 62, sd: 3, min: 35, max: 200, round: 0 },
  { id: "glucose", mean: 90, sd: 4, min: 50, max: 300, round: 0 },
  { id: "temp", mean: 36.6, sd: 0.15, min: 34, max: 42, round: 1 },
  { id: "sleep", mean: 6.2, sd: 0.5, min: 0, max: 12, round: 1 },
  { id: "mood", mean: 3.8, sd: 0.5, min: 1, max: 5, round: 0 },
  // Extra series. Keep these last so the six required series stay identical for a given seed.
  { id: "dose_daily", mean: 0.6, sd: 0.08, min: 0.2, max: 5, round: 2 },
  { id: "stress", mean: 2.2, sd: 0.6, min: 1, max: 5, round: 0 },
];

export type History = Record<string, number[]>;

function roundTo(v: number, places: number): number {
  const f = 10 ** places;
  return Math.round(v * f) / f;
}

export function generateHistory(seed = 2026, days = 30): History {
  const rand = mulberry32(seed);
  const out: History = {};
  for (const spec of INDICATORS) {
    const series: number[] = [];
    for (let d = 0; d < days; d++) {
      const raw = spec.mean + gaussian(rand) * spec.sd;
      const clamped = Math.min(spec.max, Math.max(spec.min, raw));
      series.push(roundTo(clamped, spec.round));
    }
    out[spec.id] = series;
  }
  return out;
}
