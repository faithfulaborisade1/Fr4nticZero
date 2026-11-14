import type { CSSProperties } from "react";
import type { CrewId } from "../data/crew";

// Illustrative values only: there is no connected pulse-oximeter or SpO2 data stream.
const DEMO_OXYGEN: Record<CrewId, number> = {
  alex: 98, sam: 97, noor: 99, morgan: 98, taylor: 99, jamie: 97,
};

export function CrewVitals({ crewId, name, heartRate }: { crewId: CrewId; name: string; heartRate?: number }) {
  const validHeartRate = heartRate !== undefined && Number.isFinite(heartRate) && heartRate > 0;
  const beatSeconds = validHeartRate ? 60 / Math.min(200, Math.max(35, heartRate)) : 1;
  return (
    <section className="crew-vitals" aria-label={`Simulated vital signs for ${name}`}>
      <div className="crew-vitals-head"><span>PROFILE VITALS</span><span>SIMULATED · NO SENSOR</span></div>
      <div className="crew-vitals-content">
        <div className="crew-vitals-reading"><span>HEART RATE</span><strong>{validHeartRate ? Math.round(heartRate) : "—"}<small> bpm</small></strong></div>
        <div className="crew-vitals-wave" aria-hidden="true" style={{ "--beat-duration": `${beatSeconds}s` } as CSSProperties}>
          <svg viewBox="0 0 108 38" preserveAspectRatio="none"><path className="crew-vitals-wave-grid" d="M0 19H108" /><path className="crew-vitals-wave-trace" d="M0 19 H15 L20 17 L24 19 H29 L34 22 L39 6 L44 31 L49 19 H61 L66 16 L71 19 H108" /></svg>
        </div>
        <div className="crew-vitals-reading crew-vitals-oxygen"><span>OXYGEN · SpO₂</span><strong>{DEMO_OXYGEN[crewId]}<small>%</small></strong></div>
      </div>
      <p>Latest simulated heart rate · example oxygen level</p>
    </section>
  );
}
