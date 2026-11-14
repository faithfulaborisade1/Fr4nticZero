import { indicatorLabel } from "../data/indicators";
import { kitName } from "../data/kit";
import { escalation } from "../engine/escalation";
import type { Step, Verdict } from "../engine/types";
import type { CardEntry } from "../state/cards";
import { missionTimeLabel, type ClockState } from "../state/clock";
import { missingItem, minutesToday, stepKey, type Supplies } from "../state/supplies";
import { DemoBadge, StatusBadge } from "./Badge";

const VERDICT_STYLE: Record<
  Verdict,
  { word: string; icon: string; box: string; text: string }
> = {
  crew_decides: {
    word: "Crew decides now",
    icon: "🧑‍🚀",
    box: "border-orange-400 bg-orange-500/15",
    text: "text-orange-200",
  },
  consult_earth: {
    word: "Consult Earth, hold meanwhile",
    icon: "📡",
    box: "border-sky-400 bg-sky-500/15",
    text: "text-sky-200",
  },
  monitor: {
    word: "Monitor",
    icon: "👁",
    box: "border-slate-400 bg-slate-500/15",
    text: "text-slate-200",
  },
};

export function formatRemaining(min: number): string {
  if (min <= 0) return "window closed";
  if (min >= 120) return `${Math.floor(min / 60)} h ${Math.round(min % 60)} min`;
  const m = Math.floor(min);
  const s = Math.floor((min - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

interface Props {
  entry: CardEntry;
  clock: ClockState;
  nowISO: string;
  day: number;
  blackout: boolean;
  supplies: Supplies;
  choice?: string;
  onChoose: (choice: string) => void;
  onTakeStep: (index: number, step: Step) => void;
}

export function DecisionCardView({
  entry,
  clock,
  nowISO,
  day,
  blackout,
  supplies,
  choice,
  onChoose,
  onTakeStep,
}: Props) {
  const { card, rule, baseline } = entry;
  const v = VERDICT_STYLE[card.verdict];
  const window = rule.actionWindowMin;
  const reply = card.earthReplyMin;
  const remaining = card.deadlineISO
    ? (new Date(card.deadlineISO).getTime() - new Date(nowISO).getTime()) / 60_000
    : null;
  const crewMinutes = rule.holdingSteps.reduce((a, s) => a + s.crewMinutes, 0);
  const alert = escalation(card);

  let why: string;
  if (card.verdict === "monitor") {
    why =
      window === null
        ? "Off baseline, but no action window applies."
        : "Off baseline, but not far enough to need action yet.";
  } else if (blackout) {
    why = "The link is in blackout, so Earth cannot reply in time.";
  } else if (card.verdict === "crew_decides") {
    why = `Earth reply in about ${fmt(reply)} min is longer than the ${window} min action window.`;
  } else {
    why = `Earth can reply in about ${fmt(reply)} min, inside the ${window} min action window.`;
  }

  const choices =
    card.verdict === "consult_earth"
      ? ["Hold with the steps below and wait for Earth"]
      : card.verdict === "crew_decides"
        ? ["I will follow the holding steps", "I will handle it another way"]
        : ["Noted, I will re-check"];

  return (
    <article
      aria-label={`Decision card: ${rule.indicator}`}
      className={`rounded-xl border-2 p-4 ${v.box}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={`text-xl font-bold ${v.text}`}>
          <span aria-hidden="true" className="mr-2">
            {v.icon}
          </span>
          {v.word}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={card.status} />
          <span className="rounded border border-slate-500 px-1.5 py-0.5 text-xs capitalize">
            Hazard: {rule.hazard}
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm">
        <strong>{indicatorLabel(rule.indicator)}</strong> {fmt(card.value)} · your baseline{" "}
        {fmt(baseline.mean)} ± {fmt(baseline.sd)}
      </p>
      <p className="mt-1 text-sm text-slate-200">{rule.explanation}</p>

      <div className="mt-3 rounded-lg bg-slate-950/50 p-3 text-sm">
        <div className="font-semibold">{why}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
          <span>
            Earth reply ≈ {fmt(reply)} min
            {window !== null && <> vs window {window} min</>}
          </span>
          {window !== null && <DemoBadge label="Demo action window" />}
        </div>
        {remaining !== null && (
          <div className="mt-2 text-base">
            Window closes in <strong>{formatRemaining(remaining)}</strong>{" "}
            <span className="text-xs text-slate-400">
              (by {missionTimeLabel(clock, card.deadlineISO!)}, mission clock)
            </span>
          </div>
        )}
        {card.recheckISO && (
          <div className="mt-2">
            Re-check at <strong>{missionTimeLabel(clock, card.recheckISO)}</strong>
          </div>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span aria-hidden="true">{alert.icon}</span>
        <strong>{alert.word}:</strong> {alert.text} <DemoBadge label="Demo rule" />
      </p>

      <div className="mt-3">
        <h4 className="text-sm font-semibold">Do this now</h4>
        <ol className="mt-1 space-y-2 text-sm">
          {rule.holdingSteps.map((s, i) => {
            const key = stepKey(card.id, i);
            const done = !!supplies.done[key];
            const missing = missingItem(supplies, s);
            return (
              <li key={s.text} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  {i + 1}. {s.text}{" "}
                  <span className="text-slate-400">
                    ({s.crewMinutes} min
                    {s.uses?.map((u) => `, uses ${u.qty} × ${kitName(u.item)}`).join("")})
                  </span>
                </span>
                {done ? (
                  <span className="text-emerald-300" role="status">
                    ✓ Done
                  </span>
                ) : missing ? (
                  <span className="text-red-300">⚠ Out of {kitName(missing)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTakeStep(i, s)}
                    className="min-h-11 rounded-lg border border-slate-400 px-3 text-sm hover:bg-white hover:text-slate-900"
                  >
                    Mark done
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-1 text-xs text-slate-400">
          Crew time: about {crewMinutes} min · {minutesToday(supplies, day)} min taken today
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {choice ? (
          <p className="text-sm" role="status">
            ✓ Logged: <strong>{choice}</strong>
          </p>
        ) : (
          choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChoose(c)}
              className="min-h-11 rounded-lg border border-white/70 px-4 text-sm font-medium hover:bg-white hover:text-slate-900"
            >
              {c}
            </button>
          ))
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold">How this is measured</summary>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-slate-300">On board</dt>
            <dd>{rule.measuredInSpace}</dd>
          </div>
          <div>
            <dt className="text-slate-300">Needs Earth</dt>
            <dd>{rule.needsEarth}</dd>
          </div>
        </dl>
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Threshold:</span>
        {rule.source === "DEMO" ? (
          <DemoBadge />
        ) : (
          <a className="underline" href={rule.source.url} target="_blank" rel="noreferrer">
            {rule.source.title}
          </a>
        )}
        <span>Window:</span>
        {rule.windowSource === "DEMO" ? (
          <DemoBadge />
        ) : (
          <a className="underline" href={rule.windowSource.url} target="_blank" rel="noreferrer">
            {rule.windowSource.title}
          </a>
        )}
      </div>
    </article>
  );
}
