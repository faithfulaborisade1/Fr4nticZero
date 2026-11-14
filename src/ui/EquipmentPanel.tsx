import { AT_BASE_FALLBACK, carriedOn, DEVICES, isDown, type DeviceState } from "../data/devices";
import { DemoBadge, SimulatedBadge } from "./Badge";

interface Props { state: DeviceState; envId?: string; onToggle: (id: string) => void; }

export function EquipmentPanel({ state, envId, onToggle }: Props) {
  const down = DEVICES.filter((d) => isDown(state, d.id));
  return <section aria-label="Equipment status" className="resource-panel equipment-panel">
    <div className="resource-panel-header"><div><span className="resource-kicker">ONBOARD DEVICES</span><h2>Equipment status</h2><p>Simulate a failure to see the affected steps and fallback.</p></div><div className="resource-badges"><SimulatedBadge /><DemoBadge label="Demo fallbacks" /></div></div>
    <ul className="equipment-list">{DEVICES.map((d) => {
      const failed = isDown(state, d.id);
      if (!carriedOn(envId, d.id)) {
        return <li key={d.id} className="equipment-row equipment-failed">
          <div className="equipment-row-main"><span className="resource-icon is-warning" aria-hidden="true">–</span><div className="equipment-name"><strong>{d.name}</strong><span>At base · not on the rover</span></div></div>
          <p className="equipment-fallback"><strong>On this traverse:</strong> {AT_BASE_FALLBACK}</p>
        </li>;
      }
      return <li key={d.id} className={`equipment-row ${failed ? "equipment-failed" : ""}`}>
        <div className="equipment-row-main"><span className={`resource-icon ${failed ? "is-warning" : ""}`} aria-hidden="true">{failed ? "!" : "✓"}</span><div className="equipment-name"><strong>{d.name}</strong><span>{failed ? "Failed" : "Working"}</span></div><button type="button" aria-pressed={failed} aria-label={`${failed ? "Restore" : "Mark failed"}: ${d.name}`} onClick={() => onToggle(d.id)} className={failed ? "resource-action restore-action" : "resource-action"}>{failed ? "Restore" : "Mark failed"}</button></div>
        {failed && <p className="equipment-fallback"><strong>Fallback:</strong> {d.fallback}</p>}
      </li>;
    })}</ul>
    <p className="resource-note" role="status">{down.length === 0 ? "All equipment working." : `${down.length} device${down.length > 1 ? "s" : ""} failed: ${down.map((d) => d.name).join(", ")}.`}</p>
  </section>;
}
