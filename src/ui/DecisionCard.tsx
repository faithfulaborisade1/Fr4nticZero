import { HowToButton } from "./HowToGuide";
import { DEVICE_HOW_TO } from "../data/howTo";
import { useState } from "react";
import { IndicatorIcon } from "./identity";
import { deviceIssue, getDevice, failedDeviceFor, isDown, type DeviceState } from "../data/devices";
import type { Environment } from "../engine/types";
import { indicatorLabel } from "../data/indicators";
import { kitName } from "../data/kit";
import { ACCEPT, formatSize, MAX_ATTACHMENTS, type Attachment } from "../state/attachments";
import { escalation } from "../engine/escalation";
import type { Step, Verdict } from "../engine/types";
import type { CardEntry } from "../state/cards";
import { missionTimeLabel, type ClockState } from "../state/clock";
import { missingItem, minutesToday, stepKey, type Supplies } from "../state/supplies";
import { DemoBadge, StatusBadge } from "./Badge";

const VERDICT_STYLE: Record<Verdict, { word: string; label: string }> = {
  crew_decides: { word: "Crew decides now", label: "CREW ACTION" },
  consult_earth: { word: "Consult Earth, hold meanwhile", label: "GROUND CONSULTATION" },
  monitor: { word: "Monitor", label: "MONITORING" },
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
  buddyName?: string;
  clock: ClockState;
  nowISO: string;
  day: number;
  blackout: boolean;
  supplies: Supplies;
  devices: DeviceState;
  envId?: Environment["id"];
  /** Images chosen for this card and not yet logged. */
  attachments: Attachment[];
  choice?: string;
  onChoose: (choice: string) => void;
  onTakeStep: (index: number, step: Step) => void;
  onAttach: (file: File, source: Attachment["source"]) => Promise<string | null>;
  onRemoveAttachment: (index: number) => void;
}

export function DecisionCardView({
  entry,
  buddyName,
  clock,
  nowISO,
  day,
  blackout,
  supplies,
  devices,
  envId,
  attachments,
  choice,
  onChoose,
  onTakeStep,
  onAttach,
  onRemoveAttachment,
}: Props) {
  const [source, setSource] = useState<Attachment["source"]>("camera");
  const [attachMsg, setAttachMsg] = useState("");
  const ultrasoundDown = isDown(devices, "ultrasound");
  const activeSource = ultrasoundDown ? "camera" : source;
  const failed = failedDeviceFor(devices, entry.rule.indicator);
  const { card, rule, baseline } = entry;
  const v = VERDICT_STYLE[card.verdict];
  const window = rule.actionWindowMin;
  const reply = card.earthReplyMin;
  const remaining = card.deadlineISO
    ? (new Date(card.deadlineISO).getTime() - new Date(nowISO).getTime()) / 60_000
    : null;
  const crewMinutes = rule.holdingSteps.reduce((a, s) => a + s.crewMinutes, 0);
  const alert = escalation(card, buddyName);

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
    <article aria-label={`Decision card: ${rule.indicator}`} className={`decision-case verdict-${card.verdict}`}>
      <div className="case-topline"><span><span className="case-pulse" /> ACTIVE READING</span><div><StatusBadge status={card.status} /><span className="case-hazard">{rule.hazard} hazard</span></div></div>
      <div className="case-layout">
        <div className="case-main">
          <div className="case-reading"><span className="case-kicker">FLAGGED INDICATOR</span><h3 className="dw-id-title"><IndicatorIcon id={rule.indicator} size={34} />{indicatorLabel(rule.indicator)}</h3><div className="case-reading-values"><strong>{fmt(card.value)}</strong><span>Your baseline <b>{fmt(baseline.mean)} ± {fmt(baseline.sd)}</b></span></div><p>{rule.explanation}</p></div>
          {failed && <p role="alert" className="case-device-warning">⚠ <strong>{deviceIssue(failed, envId).title}</strong>, so this reading may be out of date. Fallback: {deviceIssue(failed, envId).fallback}</p>}
          <div className="case-verdict"><div className="verdict-symbol" aria-hidden="true">{card.verdict === "crew_decides" ? "!" : card.verdict === "consult_earth" ? "↗" : "◉"}</div><div><span className="case-kicker">{v.label}</span><h4>{v.word}</h4><p>{why}</p></div></div>
        </div>
        <aside className="case-timing" aria-label="Decision timing">
          <span className="case-kicker">{remaining !== null ? "ACTION WINDOW" : "NEXT CHECK"}</span>
          {remaining !== null ? <><div className="case-clock">{formatRemaining(remaining)}</div><p>remaining · mission clock</p><div className="case-timing-rule" /><div className="timing-pair"><span>Window closes</span><strong>{missionTimeLabel(clock, card.deadlineISO!)}</strong></div></> : <><div className="case-recheck">{card.recheckISO ? missionTimeLabel(clock, card.recheckISO) : "Monitor"}</div><p>Re-check time · mission clock</p></>}
          {window !== null && <><div className="timing-pair"><span>Earth reply</span><strong>{blackout ? "Blackout" : `~${fmt(reply)} min`}</strong></div><div className="timing-pair"><span>Action window</span><strong>{window} min</strong></div><div className="case-timing-badge"><DemoBadge label="Demo action window" /></div></>}
        </aside>
      </div>
      <div className="case-alert"><span className="case-alert-icon" aria-hidden="true">◎</span><div><strong>{alert.word}</strong><p>{alert.text}</p></div><DemoBadge label="Demo rule" /><a href="#alerts" className="case-notice-link">Write shared crew notice →</a></div>
      <div className="case-lower">
        <section className="case-steps" aria-label="Holding steps">
          <div className="case-section-heading"><div><span className="case-kicker">HOLDING STEPS</span><h4>Do this now</h4></div><span className="step-estimate">~{crewMinutes} min total</span></div>
          <ol className="step-list">{rule.holdingSteps.map((s, i) => {
            const key = stepKey(card.id, i);
            const done = !!supplies.done[key];
            const missing = missingItem(supplies, s);
            const stepDevice = s.device ? getDevice(s.device) : undefined;
            const deviceDown = !!s.device && isDown(devices, s.device);
            return <li key={s.text} className="step-row"><span className={`step-number ${done ? "step-complete" : ""}`} aria-hidden="true">{done ? "✓" : String(i + 1).padStart(2, "0")}</span><div className="step-copy"><strong>{s.text}</strong><small>{s.crewMinutes} min{s.uses?.map((u) => ` · ${u.qty} × ${kitName(u.item)}`).join("")}</small>{(s.howTo ?? (s.device ? DEVICE_HOW_TO[s.device] : undefined)) && <HowToButton indicator={(s.howTo ?? DEVICE_HOW_TO[s.device!])!} compact />}{deviceDown && !done && <span className="step-warning">⚠ {stepDevice ? deviceIssue(stepDevice, envId).title : "Device unavailable"}. Fallback: {stepDevice ? deviceIssue(stepDevice, envId).fallback : ""}</span>}{!deviceDown && missing && !done && <span className="step-warning">⚠ Out of {kitName(missing)}</span>}</div>{done ? <span className="step-done" role="status">Done</span> : !deviceDown && !missing ? <button type="button" onClick={() => onTakeStep(i, s)} className="step-button">Mark done</button> : null}</li>;
          })}</ol>
          <p className="case-footnote">{minutesToday(supplies, day)} min of health steps taken today</p>
        </section>
        <section className="case-record" aria-label="Log a decision">
          <span className="case-kicker">DECISION LOG</span><h4>Record your choice</h4><p>Log your choice for simulated flight-surgeon review. Nothing is transmitted.</p>
          <div className="case-choice-list">{choice ? <p className="choice-logged" role="status">✓ Logged: <strong>{choice}</strong></p> : choices.map((c, i) => <button key={c} type="button" onClick={() => onChoose(c)} className={i === 0 ? "choice-primary" : "choice-secondary"}>{c}<span aria-hidden="true">→</span></button>)}</div>
      {!choice && (
        <details className="decision-disclosure">
          <summary className="decision-disclosure-summary">Attach an image (optional)</summary>
          <p className="mt-1 text-xs text-slate-300">
            In this demo, a photo or scan is made available in the simulated flight-surgeon view after the same delay. It is kept on this device and is <strong>not uploaded or analysed</strong>.
          </p>
          {ultrasoundDown && (
            <p className="mt-1 text-xs text-red-300">
              ⚠ {envId === "rover" ? "The ultrasound stays at base on a rover traverse" : "Ultrasound has failed"}, so only camera photos can be attached.
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              Source
              <select
                className="min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3"
                value={activeSource}
                onChange={(e) => setSource(e.target.value as Attachment["source"])}
              >
                <option value="camera">Camera photo</option>
                <option value="ultrasound" disabled={ultrasoundDown}>
                  Ultrasound scan{ultrasoundDown ? " (device down)" : ""}
                </option>
              </select>
            </label>
            <label className="flex min-h-11 cursor-pointer items-center rounded-lg border border-white/70 px-4 font-medium hover:bg-white hover:text-slate-900">
              Choose file
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                disabled={attachments.length >= MAX_ATTACHMENTS}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setAttachMsg((await onAttach(file, activeSource)) ?? "");
                }}
              />
            </label>
            <span className="text-xs text-slate-400">
              JPG, PNG, WebP or camera RAW, up to {MAX_ATTACHMENTS} images
            </span>
          </div>
          {attachMsg && (
            <p role="status" className="mt-1 text-xs text-red-300">
              {attachMsg}
            </p>
          )}
          {attachments.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-3">
              {attachments.map((a, i) => (
                <li key={`${a.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-700 p-2">
                  {a.preview ? (
                    <img src={a.preview} alt={`Preview of ${a.name}`} className="h-14 w-14 rounded object-cover" />
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
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(i)}
                    aria-label={`Remove ${a.name}`}
                    className="min-h-11 rounded-lg border border-slate-500 px-3 text-xs hover:bg-slate-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </details>
      )}
          <details className="decision-disclosure"><summary className="decision-disclosure-summary">How this is measured</summary><dl className="measurement-list"><div><dt>On board</dt><dd>{rule.measuredInSpace}</dd></div><div><dt>Needs Earth</dt><dd>{rule.needsEarth}</dd></div></dl></details>
          <div className="case-sources"><span>Threshold:</span>{rule.source === "DEMO" ? <DemoBadge /> : <a href={rule.source.url} target="_blank" rel="noreferrer">{rule.source.title}</a>}<span>Window:</span>{rule.windowSource === "DEMO" ? <DemoBadge /> : <a href={rule.windowSource.url} target="_blank" rel="noreferrer">{rule.windowSource.title}</a>}</div>
        </section>
      </div>
    </article>
  );
}
