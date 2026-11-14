import type { Status } from "../engine/types";

/** Status is always shown as colour plus a symbol and a word, never colour alone. */
export const STATUS_STYLE: Record<
  Status,
  { word: string; symbol: string; hex: string; text: string; border: string; bg: string }
> = {
  ok: {
    word: "OK",
    symbol: "✓",
    hex: "#34d399",
    text: "text-emerald-300",
    border: "border-emerald-500/60",
    bg: "bg-emerald-500/10",
  },
  watch: {
    word: "Watch",
    symbol: "▲",
    hex: "#fbbf24",
    text: "text-amber-300",
    border: "border-amber-400/70",
    bg: "bg-amber-400/10",
  },
  act: {
    word: "Act",
    symbol: "⚠",
    hex: "#f87171",
    text: "text-red-300",
    border: "border-red-400/80",
    bg: "bg-red-400/10",
  },
};
