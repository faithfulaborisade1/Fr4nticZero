import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { computeBaseline } from "../engine/baseline";
import type { Projection } from "../engine/projection";

export interface RefLine {
  y: number;
  label: string;
  position?: "insideTopLeft" | "insideBottomRight" | "insideTopRight" | "insideBottomLeft";
}

interface Props {
  label: string;
  unit: string;
  values: number[];
  decimals: number;
  statusHex: string;
  refLines?: RefLine[];
  /** On-board trend projection: dashed line for the next few days with an approximate band. */
  projection?: Projection;
}

interface Row {
  day: number;
  v?: number;
  proj?: number;
  lo?: number;
  hi?: number;
}

/** Trend of one indicator with the personal baseline (mean line, plus or minus 2 sd band). */
export function TrendChart({
  label,
  unit,
  values,
  decimals,
  statusHex,
  refLines = [],
  projection,
}: Props) {
  const data: Row[] = values.map((v, i) => ({ day: i + 1, v }));
  const showProjection = !!projection && projection.kind !== "insufficient" && projection.points.length > 0;
  if (showProjection) {
    const last = data[data.length - 1];
    last.proj = last.v; // start the dashed line at the latest reading
    for (const p of projection!.points) {
      data.push({ day: values.length + p.k, proj: p.y, lo: p.lo, hi: p.hi });
    }
  }

  const baseline = computeBaseline(values.slice(0, -1));
  const lo = baseline.mean - 2 * baseline.sd;
  const hi = baseline.mean + 2 * baseline.sd;
  const all = [
    ...values,
    lo,
    hi,
    ...refLines.map((r) => r.y),
    ...(showProjection ? projection!.points.flatMap((p) => [p.y, p.lo, p.hi]) : []),
  ];
  const pad = (Math.max(...all) - Math.min(...all)) * 0.1 || 1;
  const domain: [number, number] = [Math.min(...all) - pad, Math.max(...all) + pad];
  const last = values[values.length - 1];

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`${label} trend over ${values.length} readings. Latest ${last.toFixed(decimals)} ${unit}. Your baseline ${baseline.mean.toFixed(decimals)} ${unit}.${showProjection ? " A dashed projection continues the recent trend for five more days." : ""}`}
        className="h-44 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#315047" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#a8c4b8" fontSize={11} type="number" domain={["dataMin", "dataMax"]} />
            <YAxis
              domain={domain}
              stroke="#a8c4b8"
              fontSize={11}
              tickFormatter={(v: number) => v.toFixed(decimals > 1 ? 1 : decimals)}
              allowDecimals={decimals > 0}
            />
            <Tooltip
              contentStyle={{ background: "#10251f", border: "1px solid #426457" }}
              formatter={(v, name) => [
                `${Number(v).toFixed(decimals)} ${unit}`,
                name === "proj" ? "Projection" : name === "lo" ? "Projection low" : name === "hi" ? "Projection high" : label,
              ]}
              labelFormatter={(d) => (Number(d) > values.length ? `${Number(d) - values.length} ahead` : `Reading ${d}`)}
            />
            <ReferenceArea y1={lo} y2={hi} fill="#79c9a9" fillOpacity={0.12} />
            <ReferenceLine y={baseline.mean} stroke="#79c9a9" strokeDasharray="4 4" />
            {refLines.map((r) => (
              <ReferenceLine
                key={r.label}
                y={r.y}
                stroke="#b6c996"
                strokeDasharray="2 4"
                label={{ value: r.label, fill: "#d1debb", fontSize: 10, position: r.position ?? "insideTopLeft" }}
              />
            ))}
            <Line
              type="linear"
              dataKey="v"
              stroke="#e8ecf5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            {showProjection && (
              <>
                <Line type="linear" dataKey="lo" stroke="#fbbf24" strokeOpacity={0.5} strokeDasharray="2 4" dot={false} isAnimationActive={false} />
                <Line type="linear" dataKey="hi" stroke="#fbbf24" strokeOpacity={0.5} strokeDasharray="2 4" dot={false} isAnimationActive={false} />
                <Line type="linear" dataKey="proj" stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
              </>
            )}
            <ReferenceDot
              x={values.length}
              y={last}
              r={6}
              fill={statusHex}
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-1 text-xs text-slate-400">
        Shaded band: your baseline ± 2 sd (demo threshold). Dot colour shows the latest status.
        {showProjection && " Dashed amber: projection if the recent trend continues."}
      </figcaption>
    </figure>
  );
}
