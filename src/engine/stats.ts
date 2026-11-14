/** Pearson correlation of two series, paired by position. Returns null when it cannot be computed. */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const x = xs.slice(0, n);
  const y = ys.slice(0, n);
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

/** Plain-language strength of a correlation. A description of the data, never a claim about cause. */
export function describeCorrelation(r: number | null): string {
  if (r === null) return "Not enough variation to compare.";
  const a = Math.abs(r);
  const strength = a >= 0.7 ? "strong" : a >= 0.4 ? "moderate" : a >= 0.2 ? "weak" : "no clear";
  if (strength === "no clear") return "No clear relationship in this data.";
  return `A ${strength} ${r > 0 ? "positive" : "negative"} relationship in this data.`;
}
