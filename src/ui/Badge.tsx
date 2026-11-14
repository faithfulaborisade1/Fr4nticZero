import type { Status } from "../engine/types";
import { STATUS_STYLE } from "./status";

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${s.text} ${s.border} ${s.bg}`}
    >
      <span aria-hidden="true">{s.symbol}</span>
      {s.word}
    </span>
  );
}

export function DemoBadge({ label = "Demo parameter" }: { label?: string }) {
  return (
    <span className="rounded border border-slate-500 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
      {label}
    </span>
  );
}

export function SimulatedBadge() {
  return (
    <span className="rounded border border-emerald-500/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300">
      Simulated
    </span>
  );
}
