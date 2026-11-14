import { useState, type FormEvent } from "react";
import type { WorkoutEntry } from "../state/crew";
import { missionTimeLabel, type ClockState } from "../state/clock";
import { workoutsToday } from "../state/workouts";

const DEMO_GOAL = 2;
export function BonesAndMuscles({ name, workouts, clock, onAdd, onRemove }: { name: string; workouts: WorkoutEntry[]; clock: ClockState; onAdd: (activity: string, minutes: number) => void; onRemove: (id: string) => void }) {
  const [activity, setActivity] = useState("Strength");
  const [minutes, setMinutes] = useState("");
  const today = workoutsToday(workouts, clock);
  const totalMinutes = today.reduce((sum, workout) => sum + workout.minutes, 0);
  const now = Date.parse(clock.startISO) + clock.elapsedMin * 60_000;
  function submit(event: FormEvent) { event.preventDefault(); const duration = Number(minutes); if (!Number.isInteger(duration) || duration < 1 || duration > 720) return; onAdd(activity, duration); setMinutes(""); }
  return <section className="bones-insight" aria-label="Bones and muscles exercise log">
    <div className="bones-insight-heading"><div><span>EXERCISE / {name.toUpperCase()}</span><h3>Today’s movement</h3><p>Workouts logged on this simulated mission day.</p></div><strong>{today.length} <small>/ {DEMO_GOAL} sessions</small></strong></div>
    <div className="bones-track" role="progressbar" aria-label="Workouts toward the example daily target" aria-valuemin={0} aria-valuemax={DEMO_GOAL} aria-valuenow={Math.min(today.length, DEMO_GOAL)} aria-valuetext={`${today.length} workouts logged; example target ${DEMO_GOAL}`}><span className={today.length >= 1 ? "is-filled" : ""} /><span className={today.length >= 2 ? "is-filled" : ""} /></div>
    <p className="bones-caption">{totalMinutes} min logged today · Two sessions is an illustrative target, not a medical recommendation. Exercise entries do not assess bone density.</p>
    <form className="workout-form" onSubmit={submit}><label>Workout type<select value={activity} onChange={(event) => setActivity(event.target.value)}><option>Strength</option><option>Cardio</option><option>Mobility</option><option>Other</option></select></label><label>Duration (minutes)<input type="number" min={1} max={720} step={1} required value={minutes} onChange={(event) => setMinutes(event.target.value)} placeholder="e.g. 30" /></label><button type="submit">Log workout</button></form>
    <p className="bones-caption">Saved for this profile on this device using the simulated mission clock. It is not shared with other devices.</p>
    {workouts.length > 0 && <div className="workout-history"><h4>Workout history</h4>{[...workouts].reverse().map((workout) => <div key={workout.id}><span><strong>{workout.activity}</strong> · {workout.minutes} min <small>{missionTimeLabel(clock, workout.atISO)}{Date.parse(workout.atISO) > now ? " · later in mission" : ""}</small></span><button type="button" onClick={() => onRemove(workout.id)} aria-label={`Remove ${workout.activity} workout, ${workout.minutes} minutes, ${missionTimeLabel(clock, workout.atISO)}`}>Remove</button></div>)}</div>}
    <div className="bones-facts"><div><span>WHAT CHANGES</span><p>In microgravity, reduced loading can affect bone and muscle. NASA studies how these changes vary between crew members.</p></div><div><span>WHAT CREWS MONITOR</span><p>Mission-specific exercise and strength checks help track countermeasures. Bone density is assessed with imaging before and after flight.</p></div></div>
    <a href="https://www.nasa.gov/humans-in-space/counteracting-bone-and-muscle-loss-in-microgravity/" target="_blank" rel="noreferrer">NASA · Bone and muscle in microgravity ↗</a><a href="https://www.nasa.gov/directorates/esdmd/hhp/bone-and-mineral-evaluation-and-analysis/" target="_blank" rel="noreferrer">NASA · Bone-density research ↗</a>
  </section>;
}
