import { useState, type FormEvent } from "react";
import { INDICATOR_META } from "../data/indicators";

export interface CheckInField {
  indicator: string;
  kind: "number" | "scale";
  /** Hint under a scale field, e.g. "1 = low, 5 = great". */
  hint?: string;
}

export interface CheckInValue {
  indicator: string;
  value: number;
}

interface Props {
  title: string;
  fields: CheckInField[];
  onSubmit: (values: CheckInValue[]) => void;
}

/** Keyboard or tap entry for a region's daily readings. Empty fields are skipped. */
export function CheckIn({ title, fields, onSubmit }: Props) {
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string>("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const values: CheckInValue[] = [];
    for (const f of fields) {
      const text = raw[f.indicator];
      if (text === undefined || text === "") continue;
      const m = INDICATOR_META[f.indicator];
      const n = Number(text);
      if (!Number.isFinite(n) || n < m.min || n > m.max) {
        setMsg(`${m.label} must be between ${m.min} and ${m.max} ${m.unit}.`);
        return;
      }
      values.push({ indicator: f.indicator, value: n });
    }
    if (values.length === 0) {
      setMsg("Enter at least one reading.");
      return;
    }
    onSubmit(values);
    setRaw({});
    setMsg("Check-in logged.");
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {fields.map((f) => {
          const m = INDICATOR_META[f.indicator];
          const value = raw[f.indicator] ?? "";
          if (f.kind === "scale") {
            return (
              <fieldset key={f.indicator} className="min-w-0">
                <legend className="text-sm">
                  {m.label} ({m.min} to {m.max})
                </legend>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: m.max - m.min + 1 }, (_, i) => m.min + i).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={value === String(n)}
                      onClick={() => setRaw((p) => ({ ...p, [f.indicator]: String(n) }))}
                      className={`h-11 w-11 rounded-lg border text-base font-semibold ${
                        value === String(n)
                          ? "border-white bg-white text-slate-900"
                          : "border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {f.hint && <div className="mt-1 text-xs text-slate-400">{f.hint}</div>}
              </fieldset>
            );
          }
          return (
            <label key={f.indicator} className="block text-sm">
              {m.label} ({m.unit})
              <input
                type="number"
                inputMode="decimal"
                min={m.min}
                max={m.max}
                step={m.step}
                value={value}
                onChange={(e) => setRaw((p) => ({ ...p, [f.indicator]: e.target.value }))}
                className="mt-1 block h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3"
              />
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="min-h-11 rounded-lg border border-white/70 px-4 text-sm font-medium hover:bg-white hover:text-slate-900"
        >
          Log check-in
        </button>
        {msg && (
          <span role="status" className="text-sm text-slate-300">
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}
