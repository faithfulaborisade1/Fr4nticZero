/** Simulated pantry stock. "Days since eaten" is simulated crew history. */
export interface PantryItem {
  id: string;
  name: string;
  qty: number;
  daysSinceEaten: number;
}

export const PANTRY: PantryItem[] = [
  { id: "rehydrated_chili", name: "Rehydrated chili", qty: 6, daysSinceEaten: 2 },
  { id: "tortillas", name: "Tortillas with spread", qty: 12, daysSinceEaten: 1 },
  { id: "thermostab_chicken", name: "Thermostabilised chicken", qty: 5, daysSinceEaten: 19 },
  { id: "mac_cheese", name: "Macaroni and cheese", qty: 4, daysSinceEaten: 23 },
  { id: "fruit_cup", name: "Fruit cup", qty: 9, daysSinceEaten: 4 },
  { id: "tuna_pouch", name: "Tuna pouch", qty: 3, daysSinceEaten: 16 },
  { id: "oatmeal", name: "Oatmeal with raisins", qty: 7, daysSinceEaten: 6 },
  { id: "beef_stew", name: "Beef stew", qty: 0, daysSinceEaten: 30 },
];

/** Suggest meals not eaten recently from stock still on board. Plain variety suggestions, no calorie targets. */
export function suggestMeals(
  pantry: PantryItem[] = PANTRY,
  minDays = 14,
  max = 3,
): PantryItem[] {
  return pantry
    .filter((p) => p.qty > 0 && p.daysSinceEaten >= minDays)
    .sort((a, b) => b.daysSinceEaten - a.daysSinceEaten)
    .slice(0, max);
}
