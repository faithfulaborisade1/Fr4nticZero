import { useState } from "react";
import { indicatorLabel } from "../data/indicators";
import { getRule } from "../engine/rules";
import { formatSize } from "../state/attachments";
import type { Verdict } from "../engine/types";
import { missionTimeLabel, type ClockState } from "../state/clock";
import {
  canReview,
  linkState,
  reviewState,
  secondsToArrival,
  type LedgerEntry,
} from "../state/ledger";
import { DemoBadge, SimulatedBadge } from "./Badge";
import { formatRemaining } from "./DecisionCard";

const VERDICT_WORD: Record<Verdict, string> = {
  crew_decides: "Crew decides now",
  consult_earth: "Consult Earth, hold meanwhile",
  monitor: "Monitor",
};

const ALERT_WORD = {
  self: "🙋 Self top-up",
  buddy: "🤝 Buddy alert tier (simulated)",
  all: "📣 All-crew alert tier (simulated)",
} as const;

const ENV_LABEL = { station: "Station", moon: "Moon surface", mars: "Mars transit" } as const;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

interface Props {
  entries: LedgerEntry[];
  clock: ClockState;
  nowISO: string;
  onReview: (id: string, review: "concur" | "overrule") => void;
}

export function Ledger({ entries, clock, nowISO, onReview }: Props) {
  const [view, setView] = useState<"crew" | "surgeon">("crew");
  const sorted = [...entries].reverse();

  return (
    <section
      aria-label="Decision ledger"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Decision ledger
        </h2>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <div role="radiogroup" aria-label="Ledger view" className="flex gap-1">
            {(["crew", "surgeon"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
                  view === v
                    ? "border-white bg-white text-slate-900"
                    : "border-slate-600 hover:bg-slate-800"
                }`}
              >
                {v === "crew" ? "Crew view" : "Flight surgeon view"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "surgeon" && (
        <p className="mt-2 text-sm text-slate-300">
          Ground view. You see an entry only after it has crossed the link, and your review
          takes another one-way delay to reach the crew.
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-slate-300">
          No decisions logged yet. Choose an action on a decision card to log it here.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {sorted
            .filter((e) => view === "crew" || linkState(e, nowISO) === "delivered")
            .map((e) => (
              <LedgerRow
                key={e.id}
                e={e}
                view={view}
                clock={clock}
                nowISO={nowISO}
                onReview={onReview}
              />
            ))}
          {view === "surgeon" &&
            sorted.every((e) => linkState(e, nowISO) !== "delivered") && (
              <li className="text-sm text-slate-300">
                Nothing has reached Earth yet. Entries are still crossing the link.
              </li>
            )}
        </ul>
      )}
    </section>
  );
}

function LedgerRow({
  e,
  view,
  clock,
  nowISO,
  onReview,
}: {
  e: LedgerEntry;
  view: "crew" | "surgeon";
  clock: ClockState;
  nowISO: string;
  onReview: Props["onReview"];
}) {
  const link = linkState(e, nowISO);
  const rev = reviewState(e, nowISO);
  const wait = secondsToArrival(e, nowISO);
  const rule = getRule(e.ruleId);

  return (
    <li className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">
          {indicatorLabel(e.indicator)} {fmt(e.value)}
          <span className="ml-2 text-sm font-normal text-slate-300">
            · {VERDICT_WORD[e.verdict]}
          </span>
        </div>
        <LinkBadge state={link} />
      </div>

      <div className="mt-1 text-sm">
        Crew choice: <strong>{e.crewChoice}</strong>
        <span className="ml-2 text-slate-300">
          · {ALERT_WORD[e.alert]}
        </span>
      </div>
      {e.attachments && e.attachments.length > 0 && (
        <div className="mt-2">
          <ul className="flex flex-wrap gap-2">
            {e.attachments.map((a, i) => (
              <li key={`${a.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-700 p-1.5">
                {a.preview ? (
                  <img src={a.preview} alt={`${a.source === "ultrasound" ? "Ultrasound scan" : "Photo"} ${a.name}`} className="h-14 w-14 rounded object-cover" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded bg-slate-800 text-[10px] text-slate-300">
                    No preview
                  </span>
                )}
                <span className="text-xs">
                  {a.name}
                  <br />
                  {a.source === "ultrasound" ? "Ultrasound" : "Camera"} · {formatSize(a.sizeBytes)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate-400">
            Sent with this entry for Earth to review. Not analysed here.
          </p>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>
          Logged {missionTimeLabel(clock, e.loggedAtISO)} · {ENV_LABEL[e.envId]},{" "}
          {e.oneWayDelaySec < 60
            ? `${Math.round(e.oneWayDelaySec)} s`
            : `${fmt(e.oneWayDelaySec / 60)} min`}{" "}
          one way
        </span>
        {rule && (
          <span className="flex items-center gap-1">
            Rule {rule.id}:{" "}
            {rule.source === "DEMO" ? (
              <DemoBadge />
            ) : (
              <a className="underline" href={rule.source.url} target="_blank" rel="noreferrer">
                {rule.source.title}
              </a>
            )}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm" aria-live="polite">
        {link === "queued" && wait !== null && (
          <span>
            ⏳ Reaches Earth in <strong>{formatRemaining(wait / 60)}</strong>
          </span>
        )}
        {link === "held" && <span>⏸ Held: the link is in blackout. Sends when it returns.</span>}
        {link === "delivered" && e.deliverAtISO && rev === "none" && (
          <span>✓ Reached Earth {missionTimeLabel(clock, e.deliverAtISO)}. Awaiting review.</span>
        )}
        {rev === "in_transit" && wait !== null && (
          <span>
            📡 Surgeon review ({e.surgeonReview}) is on its way back, arriving in{" "}
            <strong>{formatRemaining(wait / 60)}</strong>
          </span>
        )}
        {rev === "held" && <span>⏸ Surgeon review held: the link is in blackout.</span>}
        {rev === "received" && (
          <span>
            ✓ Flight surgeon: <strong className="capitalize">{e.surgeonReview}</strong> (received{" "}
            {missionTimeLabel(clock, e.reviewArrivesISO!)})
          </span>
        )}
      </div>

      {view === "surgeon" && canReview(e, nowISO) && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onReview(e.id, "concur")}
            className="min-h-11 rounded-lg border border-emerald-400/70 px-4 text-sm font-medium hover:bg-emerald-400 hover:text-slate-900"
          >
            Concur
          </button>
          <button
            type="button"
            onClick={() => onReview(e.id, "overrule")}
            className="min-h-11 rounded-lg border border-red-400/70 px-4 text-sm font-medium hover:bg-red-400 hover:text-slate-900"
          >
            Overrule
          </button>
        </div>
      )}
      {view === "surgeon" && e.surgeonReview && (
        <div className="mt-2 text-sm">
          You marked this: <strong className="capitalize">{e.surgeonReview}</strong>
        </div>
      )}
    </li>
  );
}

function LinkBadge({ state }: { state: "queued" | "held" | "delivered" }) {
  const map = {
    queued: { symbol: "⏳", word: "Queued", cls: "border-amber-400/70 text-amber-300 bg-amber-400/10" },
    held: { symbol: "⏸", word: "Held (blackout)", cls: "border-red-400/70 text-red-300 bg-red-400/10" },
    delivered: { symbol: "✓", word: "Delivered", cls: "border-emerald-500/60 text-emerald-300 bg-emerald-500/10" },
  }[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${map.cls}`}
    >
      <span aria-hidden="true">{map.symbol}</span>
      {map.word}
    </span>
  );
}
