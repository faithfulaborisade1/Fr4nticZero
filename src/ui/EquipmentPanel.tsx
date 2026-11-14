import { Droplet, HeartPulse, ScanLine, Thermometer, Wind, type LucideIcon } from "lucide-react";
import { AT_BASE_FALLBACK, carriedOn, DEVICES, isDown, type DeviceState } from "../data/devices";
import { DemoBadge, SimulatedBadge } from "./Badge";

const ICONS: Record<string, LucideIcon> = {
  bp_cuff: HeartPulse,
  glucose_meter: Droplet,
  thermometer: Thermometer,
  co2_sensor: Wind,
  ultrasound: ScanLine,
};

interface Props {
  state: DeviceState;
  envId?: string;
  onToggle: (id: string) => void;
}

type RowState = "ok" | "failed" | "base";

/** Equipment status: colour-coded health per device, with a quiet switch to simulate a failure. */
export function EquipmentPanel({ state, envId, onToggle }: Props) {
  const rows = DEVICES.map((d) => ({
    device: d,
    status: (!carriedOn(envId, d.id) ? "base" : isDown(state, d.id) ? "failed" : "ok") as RowState,
  }));
  const working = rows.filter((r) => r.status === "ok").length;
  const failed = rows.filter((r) => r.status === "failed");
  const atBase = rows.filter((r) => r.status === "base");

  return (
    <section aria-label="Equipment status" className="resource-panel equipment-panel eq">
      <header className="eq-head">
        <div>
          <span className="dw-eyebrow">Onboard devices</span>
          <h2>Equipment status</h2>
          <p>Simulate a failure to see which steps it blocks and the fallback.</p>
        </div>
        <div className="eq-head-side">
          <span className={`dw-status ${failed.length ? "dw-status-act" : "dw-status-ok"}`}>
            {working}/{DEVICES.length} working
          </span>
          <div className="eq-badges">
            <SimulatedBadge />
            <DemoBadge label="Demo fallbacks" />
          </div>
        </div>
      </header>

      <ul className="eq-list">
        {rows.map(({ device: d, status }) => {
          const Icon = ICONS[d.id] ?? HeartPulse;
          return (
            <li key={d.id} className={`eq-row is-${status}`}>
              <span className="eq-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="eq-main">
                <strong>{d.name}</strong>
                <span
                  className={`dw-status ${status === "ok" ? "dw-status-ok" : status === "failed" ? "dw-status-act" : "dw-status-watch"}`}
                >
                  <span aria-hidden="true">●</span>{" "}
                  {status === "ok" ? "Working" : status === "failed" ? "Failed" : "At base · not on rover"}
                </span>
              </div>
              {status !== "base" && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={status === "failed"}
                  aria-label={`Simulate failure: ${d.name}`}
                  className="eq-switch"
                  onClick={() => onToggle(d.id)}
                >
                  <span className="eq-switch-label">{status === "failed" ? "Failure on" : "Simulate failure"}</span>
                  <span className="eq-track" aria-hidden="true">
                    <span className="eq-thumb" />
                  </span>
                </button>
              )}
              {status !== "ok" && (
                <p className="eq-fallback">
                  <strong>{status === "base" ? "On this traverse:" : "Fallback:"}</strong>{" "}
                  {status === "base" ? AT_BASE_FALLBACK : d.fallback}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="eq-note" role="status">
        {failed.length === 0 && atBase.length === 0
          ? "All equipment working."
          : [
              failed.length ? `Failed: ${failed.map((r) => r.device.name).join(", ")}.` : "",
              atBase.length ? `At base: ${atBase.map((r) => r.device.name).join(", ")}.` : "",
            ]
              .filter(Boolean)
              .join(" ")}
      </p>
    </section>
  );
}
