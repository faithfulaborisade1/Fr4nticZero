import { MEASUREMENT_GUIDES } from "../data/measurementGuides";

export function MeasurementGuide({ indicator }: { indicator: string }) {
  const guide = MEASUREMENT_GUIDES[indicator];
  if (!guide) return null;
  return <details className="measurement-guide"><summary>How to measure {guide.label.toLowerCase()}</summary><ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol><a href={guide.sourceUrl} target="_blank" rel="noreferrer">{guide.source} ↗</a></details>;
}
