import { ChevronLeft, ChevronRight, Orbit, Pause, Play, PlayCircle, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HOW_TO } from "../data/howTo";
import { HowToScene } from "./HowToScenes";
import { IndicatorIcon } from "./identity";

/* A tiny store so any button in the app can open a guide without threading props. */
let current: string | null = null;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openHowTo(indicator: string) {
  if (!HOW_TO[indicator]) return;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  current = indicator;
  emit();
}

function closeHowTo() {
  current = null;
  emit();
  returnFocus?.focus();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function hasHowTo(indicator: string): boolean {
  return !!HOW_TO[indicator];
}

/** Small trigger shown beside a measurement. Renders nothing when there is no guide. */
export function HowToButton({ indicator, compact = false }: { indicator: string; compact?: boolean }) {
  const guide = HOW_TO[indicator];
  if (!guide) return null;
  return (
    <button
      type="button"
      className={`ht-trigger ${compact ? "is-compact" : ""}`}
      onClick={() => openHowTo(indicator)}
      aria-label={`Show me how: ${guide.title.toLowerCase()}`}
    >
      <PlayCircle size={15} aria-hidden="true" />
      <span>{compact ? "How to" : "Show me how"}</span>
    </button>
  );
}

const STEP_MS = 6500;

/** Mounted once in the app; shows the open guide in a modal dialog. */
export function HowToHost() {
  const id = useSyncExternalStore(subscribe, () => current);
  const guide = id ? HOW_TO[id] : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (guide && !d.open) {
      setStep(0);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      setPlaying(!reduce);
      d.showModal();
    } else if (!guide && d.open) {
      d.close();
    }
  }, [guide]);

  // Auto-advance while playing; stop at the last step.
  useEffect(() => {
    if (!guide || !playing) return;
    if (step >= guide.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [guide, playing, step]);

  const s = guide?.steps[step];
  const last = guide ? step === guide.steps.length - 1 : false;

  return (
    <dialog
      ref={dialogRef}
      className="ht-dialog"
      aria-labelledby="ht-title"
      onClose={() => {
        if (current) closeHowTo();
      }}
      onClick={(e) => {
        // Click on the backdrop closes the guide.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      {guide && s && (
        <div className="ht-panel">
          <header className="ht-head">
            <IndicatorIcon id={guide.indicator} size={36} />
            <div>
              <h2 id="ht-title">{guide.title}</h2>
              <p>
                {guide.steps.length} steps · about {guide.minutes} min · general technique, not a flight-approved procedure
              </p>
            </div>
            <button type="button" className="dw-icon-btn" onClick={() => dialogRef.current?.close()} aria-label="Close guide">
              <X size={18} />
            </button>
          </header>

          <div className="ht-stage" role="img" aria-label={`Illustration for step ${step + 1}: ${s.title}`}>
            <HowToScene key={`${guide.indicator}-${step}`} id={s.scene} />
            <div className="ht-progress" aria-hidden="true">
              <span key={`${step}-${playing}`} className={playing && !last ? "is-running" : ""} style={{ animationDuration: `${STEP_MS}ms` }} />
            </div>
          </div>

          <div className="ht-copy" aria-live="polite">
            <span className="dw-eyebrow">
              Step {step + 1} of {guide.steps.length}
            </span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            {s.space && (
              <p className="ht-space">
                <Orbit size={15} aria-hidden="true" />
                <span>
                  <strong>In space:</strong> {s.space}
                </span>
              </p>
            )}
          </div>

          <footer className="ht-foot">
            <div className="ht-dots" role="group" aria-label="Steps">
              {guide.steps.map((st, i) => (
                <button
                  key={st.title}
                  type="button"
                  aria-label={`Step ${i + 1}: ${st.title}`}
                  aria-current={i === step ? "step" : undefined}
                  className={i === step ? "is-active" : i < step ? "is-done" : ""}
                  onClick={() => {
                    setStep(i);
                    setPlaying(false);
                  }}
                />
              ))}
            </div>
            <div className="ht-controls">
              <button
                type="button"
                className="dw-icon-btn"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause guide" : "Play guide"}
                disabled={last && !playing}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                className="dw-btn"
                onClick={() => {
                  setStep((v) => Math.max(0, v - 1));
                  setPlaying(false);
                }}
                disabled={step === 0}
              >
                <ChevronLeft size={16} aria-hidden="true" /> Back
              </button>
              {last ? (
                <button type="button" className="dw-btn dw-btn-primary" onClick={() => dialogRef.current?.close()}>
                  Done, log my reading
                </button>
              ) : (
                <button
                  type="button"
                  className="dw-btn dw-btn-primary"
                  onClick={() => {
                    setStep((v) => v + 1);
                    setPlaying(false);
                  }}
                >
                  Next <ChevronRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </footer>
          <p className="ht-source">
            Based on{" "}
            <a href={guide.source.url} target="_blank" rel="noreferrer">
              {guide.source.title}
            </a>
            . Follow your mission’s approved procedure and the device instructions.
          </p>
        </div>
      )}
    </dialog>
  );
}
