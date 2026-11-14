import { useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { History } from "../data/generator";
import { INDICATOR_META } from "../data/indicators";
import { describeCorrelation, pearson } from "../engine/stats";

const CHOICES = [
  "sleep",
  "mood",
  "stress",
  "bp_systolic",
  "hr",
  "glucose",
  "temp",
  "co2",
  "eyes_score",
  "dose_daily",
  "meals_eaten",
  "meal_rating",
];

const PRESETS: { label: string; x: string; y: string }[] = [
  { label: "Sleep vs mood", x: "sleep", y: "mood" },
  { label: "Cabin CO2 vs vision score", x: "co2", y: "eyes_score" },
  { label: "Daily dose vs sleep", x: "dose_daily", y: "sleep" },
  { label: "Meal rating vs meals eaten", x: "meal_rating", y: "meals_eaten" },
];

/** Dot plot of one indicator against another, one dot per day. Shows a pattern in the data, never a cause. */
export function CompareChart({ history }: { history: History }) {
  const [x, setX] = useState("sleep");
  const [y, setY] = useState("mood");

  const xs = history[x] ?? [];
  const ys = history[y] ?? [];
  const n = Math.min(xs.length, ys.length);
  const data = Array.from({ length: n }, (_, i) => ({ x: xs[i], y: ys[i], day: i + 1 }));
  const recent = data.slice(-5);
  const older = data.slice(0, Math.max(0, n - 5));
  const r = pearson(xs, ys);
  const mx = INDICATOR_META[x];
  const my = INDICATOR_META[y];

  const select = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex items-center gap-2 text-sm">
      {label}
      <select
        className="min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3"
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        {CHOICES.map((c) => (
          <option key={c} value={c}>
            {INDICATOR_META[c].label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section
      aria-label="Compare two indicators"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        Compare two indicators (dot plot)
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setX(p.x);
              setY(p.y);
            }}
            className={`min-h-11 rounded-lg border px-3 text-sm ${
              x === p.x && y === p.y
                ? "border-white bg-white text-slate-900"
                : "border-slate-600 hover:bg-slate-800"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {select("Across", x, setX)}
        {select("Up", y, setY)}
      </div>

      <div
        role="img"
        aria-label={`Dot plot of ${my.label} against ${mx.label}, ${n} days. ${describeCorrelation(r)}`}
        className="mt-3 h-64 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={mx.label}
              unit={` ${mx.unit}`}
              stroke="#94a3b8"
              fontSize={11}
              domain={["auto", "auto"]}
              label={{ value: `${mx.label} (${mx.unit})`, position: "insideBottom", offset: -8, fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={my.label}
              unit={` ${my.unit}`}
              stroke="#94a3b8"
              fontSize={11}
              domain={["auto", "auto"]}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ background: "#0f172a", border: "1px solid #475569" }}
            />
            <Scatter name="Earlier days" data={older} fill="#64748b" isAnimationActive={false} />
            <Scatter name="Last 5 days" data={recent} fill="#fbbf24" isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-sm">
        <span aria-hidden="true">● </span>
        <span className="text-slate-300">Earlier days</span>{" "}
        <span aria-hidden="true" className="text-amber-300">
          ●{" "}
        </span>
        <span className="text-slate-300">Last 5 days</span>
      </p>
      <p className="mt-1 text-sm">
        {r !== null && <strong>r = {r.toFixed(2)}. </strong>}
        {describeCorrelation(r)}{" "}
        <span className="text-slate-400">
          Under investigation: a pattern in simulated data, not proof that one thing causes
          the other.
        </span>
      </p>
    </section>
  );
}
