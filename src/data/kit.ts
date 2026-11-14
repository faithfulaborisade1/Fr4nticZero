/** Simulated medical kit. Quantities are demo values. */
export interface KitItem {
  id: string;
  name: string;
  qty: number;
  /** Show a low-stock flag at or below this. */
  lowAt: number;
}

export const KIT: KitItem[] = [
  { id: "bp_cuff_cover", name: "Blood pressure cuff covers", qty: 8, lowAt: 3 },
  { id: "glucose_strip", name: "Glucose test strips", qty: 20, lowAt: 5 },
  { id: "thermo_cover", name: "Thermometer probe covers", qty: 15, lowAt: 4 },
  { id: "water_pouch", name: "Drinking water pouches", qty: 24, lowAt: 6 },
];

export function kitName(id: string): string {
  return KIT.find((k) => k.id === id)?.name ?? id;
}
