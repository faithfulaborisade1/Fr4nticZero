import { RegionIcon } from "./identity";
import {
  ArrowRight,
  Flame,
  FlaskConical,
  Hourglass,
  Radio,
  Scale,
  ScanHeart,
  ScrollText,
  ShieldAlert,
  Timer,
  Trophy,
  TrendingUp,
} from "lucide-react";
import type { CrewId } from "../data/crew";
import { indicatorLabel } from "../data/indicators";
import { REGIONS } from "../data/regions";
import { ALL_CLEAR_TEXT } from "../engine/escalation";
import { describeProjection } from "../engine/projection";
import type { Environment, Verdict } from "../engine/types";
import { earthReplyMin } from "../engine/verdict";
import type { CardEntry } from "../state/cards";
import type { RegionSummary } from "../state/regions";
import type { Routine } from "../state/routine";
import { approaching, type TrendEntry } from "../state/trends";
import { CrewVitals } from "./CrewVitals";
import { formatRemaining } from "./DecisionCard";
import { ENV_META, formatDelay } from "./shell/envMeta";
import { STATUS_STYLE } from "./status";

export const VERDICT_META: Record<Verdict, { word: string; short: string; tone: string }> = {
  crew_decides: { word: "Crew decides now", short: "Crew decides", tone: "crew" },
  consult_earth: { word: "Consult Earth, hold meanwhile", short: "Consult Earth", tone: "earth" },
  monitor: { word: "Monitor and re-check", short: "Monitor", tone: "monitor" },
};

interface Props {
  crewId: CrewId;
  crewName: string;
  heartRate?: number;
  entries: CardEntry[];
  nowISO: string;
  env: Environment;
  summaries: Record<string, RegionSummary>;
  routine: Routine;
  trends: TrendEntry[];
  unreadAlerts: number;
  ledgerCount: number;
}

function why(entry: CardEntry, env: Environment): string {
  const { card, rule } = entry;
  const reply = Math.round(card.earthReplyMin);
  if (card.verdict === "monitor") return "Off your own baseline, but no action window applies yet.";
  if (env.blackout) return "The link to Earth is in blackout, so the crew must decide.";
  if (card.verdict === "crew_decides")
    return `Earth's reply (≈ ${reply} min) is longer than the ${rule.actionWindowMin} min action window.`;
  return `Earth can reply in ≈ ${reply} min, inside the ${rule.actionWindowMin} min action window.`;
}

export function OverviewPage({
  crewId,
  crewName,
  heartRate,
  entries,
  nowISO,
  env,
  summaries,
  routine,
  trends,
  unreadAlerts,
  ledgerCount,
}: Props) {
  const top = entries[0];
  const meta = ENV_META[env.id];
  const reply = earthReplyMin(env.oneWayDelaySec);
  const assessed = REGIONS.filter((r) => summaries[r.id]?.statusAvailable !== false);
  const count = (s: string) => assessed.filter((r) => summaries[r.id].status === s).length;
  const carded = new Set(entries.map((e) => e.rule.indicator));
  const watch = [...approaching(trends.filter((t) => !carded.has(t.indicator)), 7), ...trends.filter((t) => !carded.has(t.indicator) && t.projection.kind === "already")].slice(0, 3);
  const flagged = REGIONS.filter((r) => summaries[r.id]?.statusAvailable !== false)
    .sort((a, b) => {
      const rank = { act: 0, watch: 1, ok: 2 } as const;
      return rank[summaries[a.id].status] - rank[summaries[b.id].status];
    })
    .slice(0, 5);
  const remaining = top?.card.deadlineISO
    ? (new Date(top.card.deadlineISO).getTime() - new Date(nowISO).getTime()) / 60_000
    : null;

  return (
    <div className="ov">
      <section className="ov-kpis" aria-label="Key figures">
        <a href="#decisions" className="ov-kpi">
          <span className="ov-kpi-label"><Scale size={15} aria-hidden="true" /> Open decisions</span>
          <strong className="ov-kpi-value">{entries.length}</strong>
          <span className={`ov-kpi-sub tone-${top ? VERDICT_META[top.card.verdict].tone : "ok"}`}>
            {top ? `Top: ${VERDICT_META[top.card.verdict].short}` : "All clear"}
          </span>
        </a>
        <a href="#mission-settings" className="ov-kpi">
          <span className="ov-kpi-label"><Radio size={15} aria-hidden="true" /> Earth reply time</span>
          <strong className="ov-kpi-value">{env.blackout ? "—" : `${Math.round(reply)} min`}</strong>
          <span className={`ov-kpi-sub ${env.blackout ? "tone-act" : ""}`}>
            {env.blackout ? "Link in blackout" : `${meta.label} · ${formatDelay(env.oneWayDelaySec)} one-way`}
          </span>
        </a>
        <a href="#body-scan" className="ov-kpi">
          <span className="ov-kpi-label"><ScanHeart size={15} aria-hidden="true" /> Body systems</span>
          <strong className="ov-kpi-value">
            {count("act")}<small> act</small> · {count("watch")}<small> watch</small>
          </strong>
          <span className="ov-kpi-sub">{count("ok")} in range · own baseline</span>
        </a>
        <a href="#check-ins" className="ov-kpi">
          <span className="ov-kpi-label"><Trophy size={15} aria-hidden="true" /> Daily routine</span>
          <strong className="ov-kpi-value">
            {routine.done}<small>/{routine.total}</small>
          </strong>
          <span className="ov-kpi-sub">
            <Flame size={13} aria-hidden="true" /> {routine.streak}-day streak · {routine.points} pts
          </span>
        </a>
      </section>

      <div className="ov-grid">
        <section className={`dw-card ov-priority ${top ? `tone-border-${VERDICT_META[top.card.verdict].tone}` : ""}`} aria-labelledby="ov-priority-title">
          <header className="dw-card-head">
            <div>
              <span className="dw-eyebrow">Priority decision</span>
              <h2 id="ov-priority-title">{top ? "A reading needs a decision" : "No open decisions"}</h2>
            </div>
            {top && <span className="dw-pill">{entries.length} open</span>}
          </header>
          {top ? (
            <>
              <div className={`ov-verdict tone-${VERDICT_META[top.card.verdict].tone}`}>
                <span className="ov-verdict-dot" aria-hidden="true" />
                <strong>{VERDICT_META[top.card.verdict].word}</strong>
              </div>
              <p className="ov-why">{why(top, env)}</p>
              <dl className="ov-facts">
                <div>
                  <dt>Flagged reading</dt>
                  <dd>
                    {indicatorLabel(top.rule.indicator)}
                    <span className="dw-mono"> {top.card.value}</span>
                  </dd>
                  <dd className="ov-muted">Your baseline {top.baseline.mean.toFixed(0)} ± {top.baseline.sd.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>{remaining !== null ? "Action window closes in" : "Next step"}</dt>
                  <dd className="ov-big dw-mono">
                    <Timer size={16} aria-hidden="true" /> {remaining !== null ? formatRemaining(remaining) : "Re-check"}
                  </dd>
                  <dd className="ov-muted">Mission clock · demo parameter</dd>
                </div>
              </dl>
              <div className="ov-actions">
                <a className="dw-btn dw-btn-primary" href="#decisions">
                  Review decision <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a className="dw-btn" href="#body-scan">Open body scan</a>
              </div>
            </>
          ) : (
            <p className="ov-empty">{ALL_CLEAR_TEXT}</p>
          )}
        </section>

        <div className="ov-side">
          <CrewVitals crewId={crewId} name={crewName} heartRate={heartRate} />
          <RoutineCard routine={routine} />
        </div>
      </div>

      <div className="ov-grid-3">
        <section className="dw-card" aria-labelledby="ov-trend-title">
          <header className="dw-card-head">
            <div>
              <span className="dw-eyebrow">On-board trend watch</span>
              <h2 id="ov-trend-title">Heading for a flag</h2>
            </div>
            <TrendingUp size={18} aria-hidden="true" className="ov-head-icon" />
          </header>
          {watch.length === 0 ? (
            <p className="ov-muted">No indicator is heading toward its flag level. Projection of the last 7 readings.</p>
          ) : (
            <ul className="ov-list">
              {watch.map((t) => (
                <li key={t.indicator}>
                  <Hourglass size={15} aria-hidden="true" />
                  <span>{describeProjection(t.projection, t.label, t.unit, t.decimals)}</span>
                </li>
              ))}
            </ul>
          )}
          <a href="#trends" className="dw-link">Open trends <ArrowRight size={14} aria-hidden="true" /></a>
        </section>

        <section className="dw-card" aria-labelledby="ov-body-title">
          <header className="dw-card-head">
            <div>
              <span className="dw-eyebrow">{crewName} · own baseline</span>
              <h2 id="ov-body-title">Body systems</h2>
            </div>
            <ScanHeart size={18} aria-hidden="true" className="ov-head-icon" />
          </header>
          <ul className="ov-systems">
            {flagged.map((r) => {
              const s = summaries[r.id];
              return (
                <li key={r.id}>
                  <span className={`dw-status dw-status-${s.status}`}>
                    <span aria-hidden="true">{STATUS_STYLE[s.status].symbol}</span> {STATUS_STYLE[s.status].word}
                  </span>
                  <span className="ov-sys-name"><RegionIcon id={r.id} size={22} className="ov-sys-icon" />{r.label}</span>
                  <span className="ov-sys-val">{s.headline}</span>
                </li>
              );
            })}
          </ul>
          <a href="#body-scan" className="dw-link">All body systems <ArrowRight size={14} aria-hidden="true" /></a>
        </section>

        <section className="dw-card ov-links" aria-label="Go to">
          <a href="#ledger">
            <ScrollText size={18} aria-hidden="true" />
            <span><strong>Decision ledger</strong><small>{ledgerCount ? `${ledgerCount} logged` : "Nothing logged yet"}</small></span>
            <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a href="#alerts">
            <Radio size={18} aria-hidden="true" />
            <span><strong>Crew notices</strong><small>{unreadAlerts ? `${unreadAlerts} unread` : "No unread notices"}</small></span>
            <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a href="#mission-risks">
            <ShieldAlert size={18} aria-hidden="true" />
            <span><strong>Mission risks</strong><small>NASA's five hazards, prevention</small></span>
            <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a href="#research">
            <FlaskConical size={18} aria-hidden="true" />
            <span><strong>NASA research data</strong><small>Historical, separate from the simulation</small></span>
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </section>
      </div>
    </div>
  );
}

/** Daily routine progress: six check-ins and a workout. Engagement only, not a health score. */
export function RoutineCard({ routine, showLink = true }: { routine: Routine; showLink?: boolean }) {
  return (
    <section className="dw-card ov-routine" aria-labelledby="routine-title">
      <div
        className="ov-ring"
        style={{ ["--pct" as string]: `${routine.percent}` }}
        role="img"
        aria-label={`Daily routine ${routine.percent}% complete`}
      >
        <span>{routine.percent}%</span>
      </div>
      <div>
        <span className="dw-eyebrow">Today's routine</span>
        <h2 id="routine-title">
          {routine.complete ? "Routine complete" : `${routine.total - routine.done} tasks left`}
        </h2>
        <p className="ov-muted">
          {routine.checkIns}/6 check-ins · workout {routine.workout ? "done" : "not yet"} ·{" "}
          <Flame size={13} aria-hidden="true" /> {routine.streak}-day streak · {routine.points} pts
        </p>
        {showLink && (
          <a href="#check-ins" className="dw-link">
            Log check-ins <ArrowRight size={14} aria-hidden="true" />
          </a>
        )}
        <p className="ov-fine">Points reward logging habits. They are not a health score.</p>
      </div>
    </section>
  );
}
