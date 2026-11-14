import {
  CAREER_LIMIT_MSV,
  RADIATION_SOURCE,
  SPE_LIMIT_MSV,
} from "../engine/bands";
import type { Status } from "../engine/types";
import { DemoBadge } from "./Badge";
import { STATUS_STYLE } from "./status";

interface Props {
  cumulativeMsv: number;
  dailyMsv: number;
  status: Status;
}

/** Cumulative dose against the career limit, with the per-event limit marked. */
export function RadiationGauge({ cumulativeMsv, dailyMsv, status }: Props) {
  const pct = Math.min(100, (cumulativeMsv / CAREER_LIMIT_MSV) * 100);
  const spePct = (SPE_LIMIT_MSV / CAREER_LIMIT_MSV) * 100;
  const hex = STATUS_STYLE[status].hex;

  return (
    <div className="rounded-lg border border-slate-700 p-3">
      <h3 className="text-sm font-semibold">Cumulative dose</h3>
      <p className="mt-1 text-xs text-slate-400">
        Simulated feed, modelled on an onboard neutron dosimeter such as CSA's CANS.
      </p>
      <div
        role="meter"
        aria-label="Cumulative radiation dose"
        aria-valuemin={0}
        aria-valuemax={CAREER_LIMIT_MSV}
        aria-valuenow={Math.round(cumulativeMsv)}
        aria-valuetext={`${Math.round(cumulativeMsv)} millisieverts of the ${CAREER_LIMIT_MSV} millisievert career limit`}
        className="relative mt-4 h-6 rounded-full bg-slate-800"
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, 1.5)}%`, background: hex }}
        />
        <div
          className="absolute top-[-4px] h-8 w-px bg-violet-300"
          style={{ left: `${spePct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="relative mt-1 h-8 text-[11px] text-slate-300">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2 text-violet-300" style={{ left: `${spePct}%` }}>
          {SPE_LIMIT_MSV} per solar particle event
        </span>
        <span className="absolute right-0">Career limit under {CAREER_LIMIT_MSV} mSv</span>
      </div>
      <p className="mt-1 text-sm">
        <strong>{Math.round(cumulativeMsv)} mSv</strong> total · {dailyMsv.toFixed(2)} mSv today
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        Bands (watch at 50%, act at 80% of the limit): <DemoBadge />
        <a className="underline" href={RADIATION_SOURCE.url} target="_blank" rel="noreferrer">
          Source: NASA OCHMO radiation brief
        </a>
      </div>
    </div>
  );
}
