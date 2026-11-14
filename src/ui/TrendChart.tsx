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

export interface RefLine {
  y: number;
  label: string;
}

interface Props {
  label: string;
  unit: string;
  values: number[];
  decimals: number;
  statusHex: string;
  refLines?: RefLine[];
}

/** Trend of one indicator with the personal baseline (mean line, plus or minus 2 sd band). */
export function TrendChart({ label, unit, values, decimals, statusHex, refLines = [] }: Props) {
  const data = values.map((v, i) => ({ day: i + 1, v }));
  const baseline = computeBaseline(values.slice(0, -1));
  const lo = baseline.mean - 2 * baseline.sd;
  const hi = baseline.mean + 2 * baseline.sd;
  const all = [...values, lo, hi, ...refLines.map((r) => r.y)];
  const pad = (Math.max(...all) - Math.min(...all)) * 0.1 || 1;
  const domain: [number, number] = [Math.min(...all) - pad, Math.max(...all) + pad];
  const last = values[values.length - 1];

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`${label} trend over ${values.length} readings. Latest ${last.toFixed(decimals)} ${unit}. Your baseline ${baseline.mean.toFixed(decimals)} ${unit}.`}
        className="h-44 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
            <YAxis
              domain={domain}
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v: number) => v.toFixed(decimals > 1 ? 1 : decimals)}
              allowDecimals={decimals > 0}
            />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #475569" }}
              formatter={(v) => [`${Number(v).toFixed(decimals)} ${unit}`, label]}
              labelFormatter={(d) => `Reading ${d}`}
            />
            <ReferenceArea y1={lo} y2={hi} fill="#38bdf8" fillOpacity={0.12} />
            <ReferenceLine y={baseline.mean} stroke="#38bdf8" strokeDasharray="4 4" />
            {refLines.map((r) => (
              <ReferenceLine
                key={r.label}
                y={r.y}
                stroke="#a78bfa"
                strokeDasharray="2 4"
                label={{ value: r.label, fill: "#c4b5fd", fontSize: 10, position: "insideTopLeft" }}
              />
            ))}
            <Line
              type="linear"
              dataKey="v"
              stroke="#e8ecf5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot
              x={data[data.length - 1].day}
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
      </figcaption>
    </figure>
  );
}
