import { KIT } from "../data/kit";
import type { Supplies } from "../state/supplies";
import { DemoBadge, SimulatedBadge } from "./Badge";

interface Props { supplies: Supplies; onEat: (id: string) => void; }

export function SuppliesPanel({ supplies, onEat }: Props) {
  return <>
    <section aria-label="Medical kit" className="resource-panel kit-panel">
      <div className="resource-panel-header"><div><span className="resource-kicker">MEDICAL SUPPLIES</span><h2>Medical kit</h2><p>Stock is used when a holding step is marked done.</p></div><div className="resource-badges"><DemoBadge label="Demo quantities" /></div></div>
      <ul className="kit-list">{KIT.map((item) => {
        const qty = supplies.kit[item.id];
        const low = qty <= item.lowAt;
        return <li key={item.id} className="kit-row"><div><strong>{item.name}</strong><small>{low ? qty === 0 ? "Out of stock" : "Low stock" : "Available"}</small></div><span className={`stock-count ${low ? "stock-low" : ""}`}>{qty}<small>left</small></span></li>;
      })}</ul>
      <p className="resource-note">Stock levels and low-stock thresholds are simulated.</p>
    </section>
    <section aria-label="Pantry" className="resource-panel pantry-panel">
      <div className="resource-panel-header"><div><span className="resource-kicker">FOOD INVENTORY</span><h2>Pantry</h2><p>Track simulated meal stock and when each meal was last eaten.</p></div><div className="resource-badges"><SimulatedBadge /><DemoBadge label="Demo quantities" /></div></div>
      <ul className="pantry-list">{supplies.pantry.map((meal) => <li key={meal.id} className="pantry-row"><div className="meal-icon" aria-hidden="true">◇</div><div className="meal-copy"><strong>{meal.name}</strong><small>Last eaten {meal.daysSinceEaten === 0 ? "today" : meal.daysSinceEaten === 1 ? "1 day ago" : `${meal.daysSinceEaten} days ago`}</small></div><div className={`meal-stock ${meal.qty === 0 ? "stock-low" : ""}`}><strong>{meal.qty}</strong><small>{meal.qty === 0 ? "out of stock" : "left"}</small></div><button type="button" disabled={meal.qty === 0} onClick={() => onEat(meal.id)} aria-label={`Log meal: ${meal.name}`} className="resource-action meal-button">Ate one</button></li>)}</ul>
    </section>
  </>;
}
