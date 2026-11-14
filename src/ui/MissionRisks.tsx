import { MISSION_RISKS } from "../data/missionRisks";
import type { Environment } from "../engine/types";

const missions: { id: Environment["id"]; label: string }[] = [
  { id: "station", label: "Space station" }, { id: "moon", label: "Moon surface" }, { id: "rover", label: "Lunar rover" }, { id: "mars", label: "Mars transit" },
];

export function MissionRisks({ mission, onMissionChange }: { mission: Environment["id"]; onMissionChange: (id: Environment["id"]) => void }) {
  const profile = MISSION_RISKS[mission];
  return <div className="mission-risk-page">
    <section className="mission-risk-intro">
      <div><span className="eyebrow">MISSION HEALTH / FIELD GUIDE</span><h2>Know the risks. Stay prepared.</h2><p>Explore key health hazards for the selected mission and the ways crews plan for them.</p></div>
      <fieldset className="mission-risk-picker"><legend>Mission environment</legend><div>{missions.map((item) => <button type="button" key={item.id} aria-pressed={mission === item.id} onClick={() => onMissionChange(item.id)}>{item.label}</button>)}</div></fieldset>
    </section>
    <div className="mission-risk-context"><span>MISSION FOCUS</span><div><strong>{profile.label}</strong><p>{profile.focus}</p></div></div>
    <p className="mission-risk-note">This guide is organized around <a href="https://www.nasa.gov/hrp/hazards/" target="_blank" rel="noreferrer">NASA’s five hazards of human spaceflight ↗</a> and its <a href="https://www.nasa.gov/hrp/risks/" target="_blank" rel="noreferrer">human spaceflight risks ↗</a>, two resources listed for the challenge. Changing the mission also changes the simulation's mission settings. These selected considerations are educational, not a validated risk ranking or emergency procedure. For an actual event, use the mission's approved procedures and medical support.</p>
    <div className="mission-risk-list">{profile.risks.map((risk, index) => <article className="mission-risk-card" key={risk.id}>
      <div className="mission-risk-card-title"><span className="mission-risk-number">{String(index + 1).padStart(2, "0")}</span><div><span className="eyebrow">MISSION CONSIDERATION</span><h3>{risk.title}</h3></div></div>
      <div className="mission-risk-details"><div><h4>What to watch</h4><p>{risk.watch}</p></div><div><h4>Reduce exposure</h4><p>{risk.reduce}</p></div><div><h4>If it happens</h4><p>{risk.response}</p></div></div>
      <footer><span>LEARN MORE</span>{risk.sources.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</footer>
    </article>)}</div>
    <div className="mission-risk-next"><div><strong>See a flagged reading?</strong><p>Review the simulated decision cards for the selected crew profile.</p></div><a href="#decisions">Open decision support →</a></div>
  </div>;
}
