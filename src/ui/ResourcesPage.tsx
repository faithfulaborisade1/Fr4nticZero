import { DEVICES, isDown, type DeviceState } from "../data/devices";
import { KIT } from "../data/kit";
import { minutesToday, type Supplies } from "../state/supplies";
import { EquipmentPanel } from "./EquipmentPanel";
import { SuppliesPanel } from "./SuppliesPanel";

interface Props { devices: DeviceState; supplies: Supplies; day: number; onToggle: (id: string) => void; onEat: (id: string) => void; }
export function ResourcesPage({ devices, supplies, day, onToggle, onEat }: Props) {
  const failed = DEVICES.filter((device) => isDown(devices, device.id)).length;
  const low = KIT.filter((item) => supplies.kit[item.id] <= item.lowAt).length;
  return <div className="resources-page">
    <div className="resource-intro"><div><span className="resource-kicker">MISSION RESOURCES</span><h2>Onboard at a glance</h2><p>A quick look at equipment, medical supplies and health-related crew time.</p></div><span className="resource-simulation"><span className="status-pulse" /> SIMULATED</span></div>
    <div className="resource-summary" aria-label="Resource summary">
      <div><span className="resource-summary-icon" aria-hidden="true">◎</span><div><span className="resource-summary-label">EQUIPMENT</span><strong>{DEVICES.length - failed} <small>/ {DEVICES.length} working</small></strong><p className={failed ? "resource-attention" : ""}>{failed ? `${failed} failed` : "All devices available"}</p></div></div>
      <div><span className="resource-summary-icon" aria-hidden="true">◇</span><div><span className="resource-summary-label">MEDICAL KIT</span><strong>{low} <small>{low === 1 ? "item" : "items"} low or out</small></strong><p>Based on demo stock levels</p></div></div>
      <div><span className="resource-summary-icon" aria-hidden="true">◷</span><div><span className="resource-summary-label">CREW TIME TODAY</span><strong>{minutesToday(supplies, day)} <small>min</small></strong><p>Time spent on health steps</p></div></div>
    </div>
    <div className="resource-grid"><EquipmentPanel state={devices} onToggle={onToggle} /><SuppliesPanel supplies={supplies} onEat={onEat} /></div>
  </div>;
}
