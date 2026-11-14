import { useState, type FormEvent } from "react";
import { INDICATOR_META } from "../data/indicators";

const PARTS = ["survey_taste", "survey_appearance", "survey_texture", "survey_smell"] as const;

/** Weekly meal survey. The four scores are averaged into one meal rating. */
export function MealSurvey({ onSubmit }: { onSubmit: (rating: number) => void }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (PARTS.some((p) => scores[p] === undefined)) {
      setMsg("Rate all four: taste, appearance, texture and smell.");
      return;
    }
    const mean = PARTS.reduce((a, p) => a + scores[p], 0) / PARTS.length;
    onSubmit(Math.round(mean * 10) / 10);
    setScores({});
    setMsg(`Logged a meal rating of ${(Math.round(mean * 10) / 10).toFixed(1)} out of 5.`);
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <h4 className="text-sm font-semibold">Weekly meal survey</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {PARTS.map((p) => (
          <fieldset key={p}>
            <legend className="text-sm">{INDICATOR_META[p].label} (1 to 5)</legend>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={scores[p] === n}
                  onClick={() => setScores((s) => ({ ...s, [p]: n }))}
                  className={`h-11 w-11 rounded-lg border text-base font-semibold ${
                    scores[p] === n
                      ? "border-white bg-white text-slate-900"
                      : "border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="min-h-11 rounded-lg border border-white/70 px-4 text-sm font-medium hover:bg-white hover:text-slate-900"
        >
          Log meal survey
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
