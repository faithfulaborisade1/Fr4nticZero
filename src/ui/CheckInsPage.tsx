import { failedDeviceFor, type DeviceState } from "../data/devices";
import { INDICATOR_META } from "../data/indicators";
import type { ClockState } from "../state/clock";
import type { CheckInEntry } from "../state/history";
import { completedToday, DAILY_INDICATORS } from "../state/reminders";
import { CheckIn, type CheckInField, type CheckInValue } from "./CheckIn";

const GROUPS: { id: string; title: string; description: string; fields: CheckInField[] }[] = [
  { id: "heart-check", title: "Heart and blood sugar", description: "Blood pressure, heart rate and blood sugar.", fields: [{ indicator: "bp_systolic", kind: "number" }, { indicator: "hr", kind: "number" }, { indicator: "glucose", kind: "number" }] },
  { id: "temperature-check", title: "Body temperature", description: "Log the result in degrees Celsius.", fields: [{ indicator: "temp", kind: "number" }] },
  { id: "wellbeing-check", title: "Sleep and mood", description: "A short personal wellbeing check-in.", fields: [{ indicator: "sleep", kind: "number" }, { indicator: "mood", kind: "scale", hint: "1 = low, 5 = great" }] },
];

export function CheckInsPage({ name, clock, entries, devices, onCheckIn }: { name: string; clock: ClockState; entries: CheckInEntry[]; devices: DeviceState; onCheckIn: (values: CheckInValue[]) => void }) {
  const done = completedToday(entries, clock);
  const due = DAILY_INDICATORS.length - done.size;
  return <div className="checkins-page">
    <div className="checkins-intro"><span className="eyebrow">DAILY ROUTINE / SIMULATED</span><h2>{name}’s check-ins</h2><p>Record readings and find simple guides for each measurement.</p></div>
    <section className="checkins-reminder" aria-label="Today’s check-in reminders"><div className="checkins-reminder-head"><div><span className="eyebrow">MISSION DAY {Math.floor(clock.elapsedMin / 1440) + 1}</span><h3>{due === 0 ? "Today’s check-ins are complete" : `${due} ${due === 1 ? "check-in" : "check-ins"} to log today`}</h3><p>Example daily routine · {done.size} of {DAILY_INDICATORS.length} logged for this profile</p></div><span className="checkins-count">{done.size}/{DAILY_INDICATORS.length}</span></div><div className="checkins-status-list">{DAILY_INDICATORS.map((id) => <div key={id}><span className={done.has(id) ? "checkin-done" : "checkin-due"} aria-hidden="true">{done.has(id) ? "✓" : "○"}</span><span>{INDICATOR_META[id].label}</span><small>{done.has(id) ? "Logged" : "To log"}</small></div>)}</div><p className="checkins-disclosure">In-app reminder only, based on the simulated mission day and manual entries. It does not send background notifications. The mission clock is {clock.playing ? "running" : "paused"}.</p></section>
    <div className="checkins-section-title"><div><span className="eyebrow">MEASURE &amp; RECORD</span><h3>Log a check-in</h3></div><span>Enter one or more values in each form</span></div>
    <div className="checkins-forms">{GROUPS.map((group) => {
      const blocked: Record<string, string> = {};
      for (const field of group.fields) { const device = failedDeviceFor(devices, field.indicator); if (device) blocked[field.indicator] = `${device.name} is marked down. ${device.fallback}`; }
      return <section className="checkin-group" id={group.id} key={group.id}><div><h3>{group.title}</h3><p>{group.description}</p></div><CheckIn title="Enter reading" fields={group.fields} blocked={blocked} onSubmit={onCheckIn} /></section>;
    })}</div>
  </div>;
}
