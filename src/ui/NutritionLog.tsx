import { useState, type FormEvent } from "react";
import type { CheckInValue } from "./CheckIn";

const MEALS = ["Breakfast", "Lunch", "Dinner"];
const VITAMINS = ["B2", "B6", "B9", "B12"];

/** Daily tick list: meals eaten against plan, B-vitamin intake against plan, body mass. */
export function NutritionLog({ onSubmit }: { onSubmit: (values: CheckInValue[]) => void }) {
  const [meals, setMeals] = useState<Record<string, boolean>>({});
  const [vits, setVits] = useState<Record<string, boolean>>({});
  const [mass, setMass] = useState("");
  const [msg, setMsg] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const out: CheckInValue[] = [
      { indicator: "meals_eaten", value: MEALS.filter((m) => meals[m]).length },
      { indicator: "b_vitamin_count", value: VITAMINS.filter((v) => vits[v]).length },
    ];
    if (mass !== "") {
      const n = Number(mass);
      if (!Number.isFinite(n) || n < 40 || n > 150) {
        setMsg("Body mass must be between 40 and 150 kg.");
        return;
      }
      out.push({ indicator: "body_mass", value: n });
    }
    onSubmit(out);
    setMeals({});
    setVits({});
    setMass("");
    setMsg("Logged today's nutrition.");
  }

  const tick = (
    label: string,
    on: boolean,
    toggle: () => void,
  ) => (
    <label key={label} className="flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" className="h-5 w-5" checked={on} onChange={toggle} />
      {label}
    </label>
  );

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <h4 className="text-sm font-semibold">Daily nutrition log</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <fieldset>
          <legend className="text-sm font-medium">Meals eaten</legend>
          {MEALS.map((m) => tick(m, !!meals[m], () => setMeals((s) => ({ ...s, [m]: !s[m] }))))}
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">B-vitamins taken</legend>
          <div className="grid grid-cols-2">
            {VITAMINS.map((v) => tick(v, !!vits[v], () => setVits((s) => ({ ...s, [v]: !s[v] }))))}
          </div>
        </fieldset>
        <label className="block text-sm">
          Body mass (kg), optional
          <input
            type="number"
            inputMode="decimal"
            min={40}
            max={150}
            step={0.1}
            value={mass}
            onChange={(e) => setMass(e.target.value)}
            className="mt-1 block h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="min-h-11 rounded-lg border border-white/70 px-4 text-sm font-medium hover:bg-white hover:text-slate-900"
        >
          Log nutrition
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
