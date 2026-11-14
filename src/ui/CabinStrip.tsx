import { CO2_SOURCE, co2Status } from "../engine/bands";
import { IndicatorIcon } from "./identity";
const CABIN_ID: Record<string, string> = { CO2: "co2", Temperature: "temp", Pressure: "pressure", Noise: "noise" };
import { SIMULATED_CABIN } from "../data/regions";
import { DemoBadge, SimulatedBadge, StatusBadge } from "./Badge";
import { STATUS_STYLE } from "./status";

export function CabinStrip({
  co2MmHg,
  co2SensorDown = false,
}: {
  co2MmHg: number;
  co2SensorDown?: boolean;
}) {
  const c = SIMULATED_CABIN;
  // If the sensor has failed we do not know the real level, so treat it as a watch, not as "ok".
  const co2 = co2SensorDown ? ("watch" as const) : co2Status(co2MmHg);
  const tiles = [
    {
      label: "CO2",
      value: co2SensorDown ? "Sensor failed" : `${co2MmHg.toFixed(1)} mmHg`,
      status: co2,
      demo: false,
    },
    { label: "Temperature", value: `${c.tempC} °C`, status: "ok" as const, demo: true },
    { label: "Pressure", value: `${c.pressureKPa} kPa`, status: "ok" as const, demo: true },
    { label: "Noise", value: `${c.noiseDb} dB`, status: "ok" as const, demo: true },
  ];
  return (
    <section
      aria-label="Closed environment"
      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Closed environment · cabin
        </h2>
        <SimulatedBadge />
      </div>
      <div className="cabin-grid mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => {
          const s = STATUS_STYLE[t.status];
          return (
            <div
              key={t.label}
              className={`rounded-lg border-l-4 border-y border-r p-3 ${s.border} ${s.bg}`}
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="dw-id-title font-medium"><IndicatorIcon id={CABIN_ID[t.label] ?? "co2"} size={26} />{t.label}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-1 text-lg font-semibold">{t.value}</div>
              <div className="mt-1 text-xs text-slate-400">
                {t.label === "CO2" && co2SensorDown ? (
                  <span>
                    Last good reading {co2MmHg.toFixed(1)} mmHg. Check ventilation by hand.
                  </span>
                ) : t.label === "CO2" ? (
                  <a className="underline" href={CO2_SOURCE.url} target="_blank" rel="noreferrer">
                    Source: NASA CO2 on the ISS
                  </a>
                ) : (
                  t.demo && <DemoBadge />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
