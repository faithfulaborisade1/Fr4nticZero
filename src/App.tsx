import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_WORKING, type DeviceState } from "./data/devices";
import { CREW, DEFAULT_CREW, getCrew, type CrewId } from "./data/crew";
import { generateHistory } from "./data/generator";
import { HAZARDS, regionInHazard, type HazardFilter } from "./data/hazards";
import { REGIONS, type RegionId } from "./data/regions";
import { indicatorLabel } from "./data/indicators";
import { DEFAULT_SCENARIO, getScenario } from "./data/scenarios";
import { evaluateCrosslinks } from "./engine/crosslinks";
import { MARS_DELAY_MAX_SEC, makeEnvironment } from "./engine/environments";
import { ALL_CLEAR_TEXT } from "./engine/escalation";
import type { Environment, Step } from "./engine/types";
import { toAttachment, validateImage, type Attachment } from "./state/attachments";
import { buildCards } from "./state/cards";
import { createCrewWorkspace, createLocalId, crewCardId, emptyRecord, updateRecord, type CrewRecord, type MedicationEntry } from "./state/crew";
import {
  createClock,
  jumpToDay,
  missionDay,
  nowISO,
  pause,
  play,
  tick,
} from "./state/clock";
import {
  appendCheckIns,
  readingTimeFor,
  visibleHistory,
} from "./state/history";
import {
  addEntry,
  createEntry,
  releaseHeld,
  reviewEntry,
} from "./state/ledger";
import { clearSaved, loadSaved, saveState, type SavedState } from "./state/persist";
import { buildSummaries } from "./state/regions";
import { buildTrends } from "./state/trends";
import { eatMeal, initialSupplies, stepKey, takeStep } from "./state/supplies";
import { BodyScan } from "./ui/BodyScan";
import { CrewAlertsPage, CrewMessagesPage, CrewProfilesPage, MedicationPage } from "./ui/CrewPages";
import { CrewVitals } from "./ui/CrewVitals";
import { MissionRisks } from "./ui/MissionRisks";
import { CheckInsPage } from "./ui/CheckInsPage";
import { EmergencyPage } from "./ui/EmergencyPage";
import { completedToday, DAILY_INDICATORS } from "./state/reminders";
import { resolvePageHash } from "./state/navigation";
import { workoutsToday } from "./state/workouts";
import type { WorkoutEntry } from "./state/crew";
import { useCrewComms } from "./state/useCrewComms";
import { CabinStrip } from "./ui/CabinStrip";
import type { CheckInValue } from "./ui/CheckIn";
import { CompareChart } from "./ui/CompareChart";
import { DecisionCardView, formatRemaining } from "./ui/DecisionCard";
import { ResourcesPage } from "./ui/ResourcesPage";
import { ResearchPage } from "./ui/ResearchPage";
import { EnvironmentBar } from "./ui/EnvironmentBar";
import { HazardTabs } from "./ui/HazardTabs";
import { Ledger } from "./ui/Ledger";
import { RegionCard } from "./ui/RegionCard";
import { RegionDetail } from "./ui/RegionDetail";
import { ScenarioBar } from "./ui/ScenarioBar";
import { TrendWatch } from "./ui/TrendWatch";

const PAGES = {
  crew: { title: "Crew profiles", description: "Choose a simulated crew member to view their health and records." },
  messages: { title: "Crew connection", description: "A shared space for the simulated crew to stay connected." },
  alerts: { title: "Crew notices", description: "Send a notice to a crew member or the whole crew." },
  medications: { title: "Medication log", description: "Record medication notes for the selected profile." },
  overview: { title: "Mission overview", description: "The essentials, at a glance." },
  decisions: { title: "Decision support", description: "Review flagged readings and decide what happens next." },
  "body-scan": { title: "Body scan", description: "Explore the crew member’s health by body system." },
  "mission-settings": { title: "Mission settings", description: "Set the environment and communication conditions for the simulation." },
  "mission-risks": { title: "Mission health risks", description: "Understand the hazards and prepare for the mission ahead." },
  "check-ins": { title: "Daily check-ins", description: "Review your routine and record health readings." },
  emergency: { title: "Emergency support", description: "Seek crew help and follow your mission's approved procedures." },
  trends: { title: "Trends & hazards", description: "Explore patterns and the conditions affecting crew health." },
  ledger: { title: "Decision ledger", description: "Follow decisions and reviews as they travel between crew and Earth." },
  resources: { title: "Resources", description: "Check equipment, supplies and crew time." },
  research: { title: "Real research data", description: "Explore historical measurements from a real spaceflight." },
} as const;
type Page = keyof typeof PAGES;
const PAGE_IDS = Object.keys(PAGES) as Page[];
const EMPTY_WORKOUTS: WorkoutEntry[] = [];
function pageFromHash(): Page {
  return resolvePageHash(window.location.hash, PAGE_IDS) ?? "overview";
}
const HISTORY_DAYS = 30;
// Start paused, one mission minute per real second.
const INITIAL_CLOCK = jumpToDay(
  createClock(undefined, 1),
  getScenario(DEFAULT_SCENARIO).startDay,
);

// Restore what the crew did before a reload. The clock always comes back paused.
const SAVED = loadSaved();
const START_CLOCK = SAVED
  ? { ...INITIAL_CLOCK, elapsedMin: SAVED.elapsedMin, speed: SAVED.speed }
  : INITIAL_CLOCK;

export default function App() {
  const [crew, setCrew] = useState(() => SAVED?.crew ?? createCrewWorkspace(SAVED ? { checkIns: SAVED.checkIns, ledger: SAVED.ledger, dismissed: SAVED.dismissed, pending: SAVED.pending } : undefined));
  const activeCrew = getCrew(crew.activeId);
  const { ledger, checkIns, dismissed, pending } = crew.records[activeCrew.id];
  const workouts = crew.records[activeCrew.id].workouts ?? EMPTY_WORKOUTS;
  const baseHistory = useMemo(() => generateHistory(activeCrew.seed, HISTORY_DAYS), [activeCrew.seed]);
  const sharedBaseHistory = useMemo(() => generateHistory(2026, HISTORY_DAYS), []);
  const comms = useCrewComms();
  const commsIdentity = comms.identity;
  const unreadAlerts = commsIdentity ? comms.alerts.filter((alert) => (alert.to === "all" || alert.to === commsIdentity) && !alert.readBy.includes(commsIdentity)).length : 0;
  function updateCrewRecord(id: CrewId, update: (record: CrewRecord) => CrewRecord) { setCrew((current) => updateRecord(current, id, update)); }
  function selectCrew(id: CrewId) { setCrew((current) => ({ ...current, activeId: id })); setSelected(null); setHovered(null); }

  const [clock, setClock] = useState(START_CLOCK);
  const [scenarioId, setScenarioId] = useState(SAVED?.scenarioId ?? DEFAULT_SCENARIO);
  const [supplies, setSupplies] = useState(() => SAVED?.supplies ?? initialSupplies());
  const [hazard, setHazard] = useState<HazardFilter>(SAVED?.hazard ?? "all");
  const [devices, setDevices] = useState<DeviceState>(SAVED?.devices ?? ALL_WORKING);

  const [envId, setEnvId] = useState<Environment["id"]>(SAVED?.envId ?? "station");
  const [delaySec, setDelaySec] = useState(SAVED?.delaySec ?? MARS_DELAY_MAX_SEC);
  const [blackout, setBlackout] = useState(SAVED?.blackout ?? false);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [page, setPage] = useState<Page>(pageFromHash);
  useEffect(() => {
    const onHashChange = () => { const next = resolvePageHash(window.location.hash, PAGE_IDS); if (next) { setPage(next); window.scrollTo({ top: 0 }); } };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => { document.title = `${PAGES[page].title} · Decision Window`; }, [page]);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setClock((c) => tick(c, 0.25)), 250);
    return () => clearInterval(id);
  }, []);

  // Keep the latest state in a ref and save it every second, and again when the page is
  // hidden or closed. (A debounce would never fire while the mission clock is ticking.)
  const latestRef = useRef<SavedState | null>(null);
  latestRef.current = {
    v: 1,
    scenarioId,
    elapsedMin: clock.elapsedMin,
    speed: clock.speed,
    envId,
    delaySec,
    blackout,
    hazard,
    crew,
    ledger: crew.records[DEFAULT_CREW].ledger,
    checkIns: crew.records[DEFAULT_CREW].checkIns,
    dismissed: crew.records[DEFAULT_CREW].dismissed,
    supplies,
    devices,
    pending: crew.records[DEFAULT_CREW].pending,
  };
  useEffect(() => {
    const save = () => {
      if (latestRef.current) saveState(latestRef.current);
    };
    const id = setInterval(save, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    // Let the figure zoom in first, then bring the details into view.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () =>
        detailRef.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "nearest",
        }),
      reduce ? 0 : 450,
    );
    return () => clearTimeout(t);
  }, [selected]);

  const day = missionDay(clock);
  const dueCheckIns = DAILY_INDICATORS.length - completedToday(checkIns, clock).size;
  const fullHistory = useMemo(() => {
    const missionHistory = getScenario(scenarioId).apply(sharedBaseHistory);
    return activeCrew.id === DEFAULT_CREW ? missionHistory : { ...baseHistory, co2: missionHistory.co2 };
  }, [baseHistory, sharedBaseHistory, scenarioId, activeCrew.id]);
  const visible = useMemo(() => visibleHistory(fullHistory, day), [fullHistory, day]);
  const history = useMemo(() => appendCheckIns(visible, checkIns), [visible, checkIns]);

  const links = useMemo(() => evaluateCrosslinks(history), [history]);
  const workoutCount = workoutsToday(workouts, clock).length;
  const summaries = useMemo(() => buildSummaries(history, links, workoutCount), [history, links, workoutCount]);
  const trends = useMemo(() => buildTrends(history), [history]);

  const env = makeEnvironment(envId, delaySec, blackout);
  const entries = useMemo(
    () =>
      buildCards(history, makeEnvironment(envId, delaySec, blackout), (ind) =>
        readingTimeFor(
          ind,
          clock.startISO,
          Math.min(day + 1, fullHistory[ind]?.length ?? 1),
          checkIns,
        ),
      ).map((entry) => ({ ...entry, card: { ...entry.card, id: crewCardId(activeCrew.id, entry.card.id) } })),
    [history, envId, delaySec, blackout, clock.startISO, day, fullHistory, checkIns, activeCrew.id],
  );
  const now = nowISO(clock);
  const nudges = links.nudges.filter((n) => !dismissed[n.id]);

  const shownEntries = entries.filter((e) => hazard === "all" || e.rule.hazard === hazard);
  const left = REGIONS.filter((r) => r.side === "left" && regionInHazard(r.id, hazard));
  const right = REGIONS.filter((r) => r.side === "right" && regionInHazard(r.id, hazard));
  const hazardControl = <label className="hazard-control">Filter by hazard <select value={hazard} onChange={(e) => setHazard(e.target.value as HazardFilter)}><option value="all">All hazards</option>{HAZARDS.map((h) => <option value={h.id} key={h.id}>{h.label}</option>)}</select></label>;

  const card = (r: (typeof REGIONS)[number]) => (
    <RegionCard
      key={r.id}
      meta={r}
      summary={summaries[r.id]}
      selected={selected === r.id}
      onSelect={() => setSelected(r.id)}
      onHover={(on) => setHovered(on ? r.id : null)}
    />
  );

  function chooseScenario(id: string) {
    setScenarioId(id);
    setClock((c) => pause(jumpToDay(c, getScenario(id).startDay)));
    setCrew((current) => ({ ...current, records: Object.fromEntries(CREW.map((person) => [person.id, { ...emptyRecord(), medications: current.records[person.id].medications, workouts: current.records[person.id].workouts ?? [] }])) as typeof current.records }));
    setSupplies(initialSupplies());
    setDevices(ALL_WORKING);
  }

  function changeEnvironment(id: Environment["id"]) {
    setEnvId(id);
    if (id === "moon") setDelaySec(8);
    if (id === "mars") setDelaySec(MARS_DELAY_MAX_SEC);
  }

  /** Back to the opening state of the demo: scenario 1 on Station, nothing logged. */
  function resetDemo() {
    clearSaved();
    chooseScenario(DEFAULT_SCENARIO);
    setCrew(createCrewWorkspace());
    setEnvId("station");
    setDelaySec(MARS_DELAY_MAX_SEC);
    setBlackout(false);
    setHazard("all");
    setDevices(ALL_WORKING);
    setSelected(null);
    setClock(INITIAL_CLOCK);
  }

  function takeCardStep(cardId: string, index: number, step: Step) {
    setSupplies((s) => takeStep(s, stepKey(cardId, index), step, day));
  }

  function logChoice(entry: (typeof entries)[number], choice: string) {
    const files = pending[entry.card.id] ?? [];
    updateCrewRecord(activeCrew.id, (record) => {
      const { [entry.card.id]: _sent, ...rest } = record.pending;
      void _sent;
      return { ...record, ledger: addEntry(record.ledger, createEntry(entry.card, entry.rule, choice, env, nowISO(clock), files)), pending: rest };
    });
    // Start the mission clock so the entry can be seen crossing the link.
    setClock((c) => (c.playing ? c : play(c)));
  }

  function changeBlackout(on: boolean) {
    setBlackout(on);
    if (!on) {
      setCrew((current) => ({ ...current, records: Object.fromEntries(CREW.map((person) => [person.id, { ...current.records[person.id], ledger: releaseHeld(current.records[person.id].ledger, makeEnvironment(envId, delaySec, false), nowISO(clock)) }])) as typeof current.records }));
    }
  }

  function surgeonReview(id: string, review: "concur" | "overrule") {
    updateCrewRecord(activeCrew.id, (record) => ({ ...record, ledger: reviewEntry(record.ledger, id, review, env, nowISO(clock)) }));
  }

  /** Returns an error message, or null if the file was attached. */
  async function attachImage(
    cardId: string,
    file: File,
    source: Attachment["source"],
  ): Promise<string | null> {
    const owner = activeCrew.id;
    const error = validateImage(file, pending[cardId]?.length ?? 0);
    if (error) return error;
    const att = await toAttachment(file, source);
    updateCrewRecord(owner, (record) => ({ ...record, pending: { ...record.pending, [cardId]: [...(record.pending[cardId] ?? []), att] } }));
    return null;
  }

  function removeImage(cardId: string, index: number) {
    updateCrewRecord(activeCrew.id, (record) => ({ ...record, pending: { ...record.pending, [cardId]: (record.pending[cardId] ?? []).filter((_, i) => i !== index) } }));
  }

  function logCheckIn(values: CheckInValue[]) {
    const atISO = nowISO(clock);
    updateCrewRecord(activeCrew.id, (record) => ({ ...record, checkIns: [...record.checkIns, ...values.map((v) => ({ ...v, atISO }))] }));
  }

  function dismissNudge(id: string) { updateCrewRecord(activeCrew.id, (record) => ({ ...record, dismissed: { ...record.dismissed, [id]: true } })); }
  function saveMedication(name: string, status: MedicationEntry["status"], note: string) { updateCrewRecord(activeCrew.id, (record) => ({ ...record, medications: [...record.medications, { id: createLocalId(), name, status, note, atISO: nowISO(clock) }] })); }
  function markMedication(id: string, status: "taken" | "skipped") { updateCrewRecord(activeCrew.id, (record) => ({ ...record, medications: record.medications.map((entry) => entry.id === id ? { ...entry, status, updatedAtISO: nowISO(clock) } : entry) })); }
  function logWorkout(activity: string, minutes: number) { const atISO = nowISO(clock); updateCrewRecord(activeCrew.id, (record) => ({ ...record, workouts: [...(record.workouts ?? []), { id: createLocalId(), activity, minutes, atISO }] })); }
  function removeWorkout(id: string) { updateCrewRecord(activeCrew.id, (record) => ({ ...record, workouts: (record.workouts ?? []).filter((workout) => workout.id !== id) })); }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <a className="brand" href="#overview" aria-label="Decision Window home">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-name"><strong>DECISION WINDOW</strong><small>CREW HEALTH SYSTEMS</small></span>
          </a>
          <button type="button" className="sidebar-toggle sidebar-toggle-desktop" aria-expanded={!sidebarCollapsed} aria-controls="sidebar-navigation" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed((value) => !value)}><span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span></button>
          <button type="button" className="sidebar-toggle sidebar-toggle-mobile" aria-expanded={mobileNavOpen} aria-controls="sidebar-navigation" aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMobileNavOpen((value) => !value)}><span aria-hidden="true">{mobileNavOpen ? "×" : "☰"}</span></button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav id="sidebar-navigation" className="side-nav" aria-label="Main navigation" onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) setMobileNavOpen(false); }}>
          <a href="#crew" aria-current={page === "crew" ? "page" : undefined} aria-label="Crew profiles" title="Crew profiles"><span className="nav-icon" aria-hidden="true">◉</span><span className="nav-label">Crew profiles</span></a>
          <a href="#overview" aria-current={page === "overview" ? "page" : undefined} aria-label="Overview" title="Overview"><span className="nav-icon" aria-hidden="true">◫</span><span className="nav-label">Overview</span></a>
          <a href="#decisions" aria-current={page === "decisions" ? "page" : undefined} aria-label={`Decisions, ${entries.length} active`} title="Decisions"><span className="nav-icon" aria-hidden="true">◈</span><span className="nav-label">Decisions</span><b>{entries.length}</b></a>
          <a href="#body-scan" aria-current={page === "body-scan" ? "page" : undefined} aria-label="Body scan" title="Body scan"><span className="nav-icon" aria-hidden="true">◎</span><span className="nav-label">Body scan</span></a>
          <a href="#check-ins" aria-current={page === "check-ins" ? "page" : undefined} aria-label={`Daily check-ins, ${dueCheckIns} to log`} title="Daily check-ins"><span className="nav-icon" aria-hidden="true">◷</span><span className="nav-label">Daily check-ins</span>{dueCheckIns > 0 && <b>{dueCheckIns}</b>}</a>
          <a href="#mission-settings" aria-current={page === "mission-settings" ? "page" : undefined} aria-label="Mission settings" title="Mission settings"><span className="nav-icon" aria-hidden="true">⌁</span><span className="nav-label">Mission settings</span></a>
          <a href="#mission-risks" aria-current={page === "mission-risks" ? "page" : undefined} aria-label="Mission health risks" title="Mission health risks"><span className="nav-icon" aria-hidden="true">◬</span><span className="nav-label">Mission risks</span></a>
          <div className="sidebar-label">CREW CONNECTION</div>
          <a href="#messages" aria-current={page === "messages" ? "page" : undefined} aria-label="Crew messages" title="Crew messages"><span className="nav-icon" aria-hidden="true">◻</span><span className="nav-label">Crew messages</span></a>
          <a href="#alerts" aria-current={page === "alerts" ? "page" : undefined} aria-label="Crew notices" title="Crew notices"><span className="nav-icon" aria-hidden="true">◈</span><span className="nav-label">Crew notices</span>{unreadAlerts > 0 && <b>{unreadAlerts}</b>}</a>
          <a href="#medications" aria-current={page === "medications" ? "page" : undefined} aria-label="Medication log" title="Medication log"><span className="nav-icon" aria-hidden="true">✚</span><span className="nav-label">Medication log</span></a>
          <div className="sidebar-label">MISSION INTELLIGENCE</div>
          <a href="#trends" aria-current={page === "trends" ? "page" : undefined} aria-label="Trends and hazards" title="Trends and hazards"><span className="nav-icon" aria-hidden="true">↗</span><span className="nav-label">Trends &amp; hazards</span></a>
          <a href="#research" aria-current={page === "research" ? "page" : undefined} aria-label="Real research data" title="Real research data"><span className="nav-icon" aria-hidden="true">◌</span><span className="nav-label">Real research data</span></a>
          <a href="#ledger" aria-current={page === "ledger" ? "page" : undefined} aria-label="Decision ledger" title="Decision ledger"><span className="nav-icon" aria-hidden="true">▤</span><span className="nav-label">Decision ledger</span></a>
          <a href="#resources" aria-current={page === "resources" ? "page" : undefined} aria-label="Resources" title="Resources"><span className="nav-icon" aria-hidden="true">◇</span><span className="nav-label">Resources</span></a>
        </nav>
        <div className="sidebar-footer"><span className="status-pulse" /> SIMULATION ACTIVE<small>MISSION DAY {day + 1} · SIX SIMULATED PROFILES</small></div>
      </aside>

      <main className="workspace" id="main-content">
        <a href="#emergency" className="emergency-quick" aria-current={page === "emergency" ? "page" : undefined}><span aria-hidden="true">✚</span> Emergency</a>
        <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> MISSION HEALTH / {page === "overview" ? "OVERVIEW" : PAGES[page].title.toUpperCase()}</div>
            <h1>{PAGES[page].title}</h1>
            <p>{PAGES[page].description}</p>
          </div>
          <div className="heading-right">{page !== "research" && <CrewVitals crewId={activeCrew.id} name={activeCrew.name} heartRate={history.hr?.at(-1)} />}<div className="heading-meta">{page === "research" ? <><span>DATA SOURCE</span><strong>NASA &amp; study</strong><small>HISTORICAL RESEARCH</small></> : <><span>MISSION DAY</span><strong>{day + 1}</strong><small>SIMULATED DATA</small></>}</div></div>
        </div>

        {page !== "research" && <div className="active-crew-bar"><div><span className="crew-avatar tiny" aria-hidden="true">{activeCrew.name.split(" ").map((word) => word[0]).join("")}</span><span><small>VIEWING SIMULATED PROFILE</small><strong>{activeCrew.name}</strong></span></div><label><span className="sr-only">Select crew profile</span><select value={activeCrew.id} onChange={(e) => selectCrew(e.target.value as CrewId)}>{CREW.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label></div>}
        {page === "overview" && <div className="overview-layout">
          <section className="overview-priority" aria-labelledby="priority-heading">
            <div className="overview-section-top"><div><span className="eyebrow">YOUR PRIORITY</span><h2 id="priority-heading">{entries.length ? "A reading needs attention" : "No active decisions"}</h2></div><span className="overview-count">{entries.length} active</span></div>
            {entries.length ? <>
              <div className={`priority-verdict priority-${entries[0].card.verdict}`}><span className="priority-dot" />{entries[0].card.verdict === "crew_decides" ? "Crew decides now" : entries[0].card.verdict === "consult_earth" ? "Consult Earth, hold meanwhile" : "Monitor"}</div>
              <div className="priority-reading"><div><span>FLAGGED READING</span><strong>{indicatorLabel(entries[0].rule.indicator)}</strong><p>{entries[0].card.value} · baseline {entries[0].baseline.mean.toFixed(1)}</p></div><div><span>{entries[0].card.deadlineISO ? "TIME REMAINING" : "NEXT STEP"}</span><strong>{entries[0].card.deadlineISO ? formatRemaining((new Date(entries[0].card.deadlineISO).getTime() - new Date(now).getTime()) / 60_000) : "Re-check"}</strong><p>Mission clock · demo parameters</p></div></div>
              <a className="primary-link" href="#decisions">Review {entries.length === 1 ? "decision" : "decisions"} <span aria-hidden="true">→</span></a>
            </> : <><p className="overview-empty">{ALL_CLEAR_TEXT}</p><a className="secondary-link" href="#decisions">View decision support →</a></>}
          </section>
          <section className="overview-summary" aria-labelledby="health-heading"><div className="overview-section-top"><div><span className="eyebrow">CREW HEALTH</span><h2 id="health-heading">Body systems</h2></div><a href="#body-scan">View scan ↗</a></div><p>{activeCrew.name} · simulated personal baseline</p><div className="summary-metrics"><div><strong>{REGIONS.filter((r) => summaries[r.id].statusAvailable !== false && summaries[r.id].status === "act").length}</strong><span>Need action</span></div><div><strong>{REGIONS.filter((r) => summaries[r.id].statusAvailable !== false && summaries[r.id].status === "watch").length}</strong><span>To watch</span></div><div><strong>{REGIONS.filter((r) => summaries[r.id].statusAvailable !== false && summaries[r.id].status === "ok").length}</strong><span>In range</span></div></div><a className="summary-row" href="#body-scan"><span>Explore all body systems</span><span aria-hidden="true">→</span></a></section>
          {unreadAlerts > 0 && <a className="crew-overview-alert" href="#alerts"><strong>{unreadAlerts} unread crew {unreadAlerts === 1 ? "notice" : "notices"}</strong><span>View your shared notices →</span></a>}
          <a className="research-overview-link" href="#check-ins"><span className="research-overview-icon" aria-hidden="true">◷</span><span><strong>{dueCheckIns === 0 ? "Daily check-ins complete" : `${dueCheckIns} daily ${dueCheckIns === 1 ? "check-in" : "check-ins"} to log`}</strong><small>Simulated mission-day routine · measurement guides included</small></span><span aria-hidden="true">→</span></a>
          <a className="research-overview-link" href="#research"><span className="research-overview-icon" aria-hidden="true">◌</span><span><strong>Explore real spaceflight data</strong><small>Historical NASA lab and ISS measurements · separate from the simulation</small></span><span aria-hidden="true">→</span></a>
          <a className="research-overview-link" href="#mission-risks"><span className="research-overview-icon" aria-hidden="true">◬</span><span><strong>Prepare for mission health risks</strong><small>Key considerations, prevention and response for this mission</small></span><span aria-hidden="true">→</span></a>
          <div className="overview-links"><a href="#trends"><span className="quick-icon">↗</span><span><strong>Trends &amp; hazards</strong><small>Explore changes and mission conditions</small></span><span aria-hidden="true">→</span></a><a href="#ledger"><span className="quick-icon">▤</span><span><strong>Decision ledger</strong><small>{ledger.length === 0 ? "No decisions logged yet" : `${ledger.length} logged ${ledger.length === 1 ? "decision" : "decisions"}`}</small></span><span aria-hidden="true">→</span></a><a href="#resources"><span className="quick-icon">◇</span><span><strong>Resources</strong><small>Equipment, supplies and crew time</small></span><span aria-hidden="true">→</span></a></div>
        </div>}

        {page === "decisions" && <section className="decision-panel page-panel" aria-label="Decision cards">
          <div className="decision-toolbar"><div><span className="eyebrow">DECISION WINDOW</span><h2>Active readings <span>{shownEntries.length}</span></h2><p>Review the situation, then record your choice.</p></div>{hazardControl}</div>
          {shownEntries.length === 0 ? <p className="all-clear">✓ {entries.length === 0 ? ALL_CLEAR_TEXT : "No flagged readings for this hazard."}</p> : shownEntries.map((e) => <DecisionCardView key={e.card.id} entry={e} buddyName={getCrew(activeCrew.buddy).name.split(" ")[0]} clock={clock} nowISO={now} day={day} blackout={blackout} supplies={supplies} devices={devices} attachments={pending[e.card.id] ?? []} choice={ledger.find((l) => l.id === e.card.id)?.crewChoice} onChoose={(c) => logChoice(e, c)} onTakeStep={(i, step) => takeCardStep(e.card.id, i, step)} onAttach={(file, source) => attachImage(e.card.id, file, source)} onRemoveAttachment={(i) => removeImage(e.card.id, i)} />)}
          {nudges.map((n) => <div key={n.id} role="status" className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-sky-400/40 p-3 text-sm"><span>{n.text}</span><button type="button" onClick={() => dismissNudge(n.id)} className="min-h-11 rounded-lg border border-slate-500 px-3">Done</button></div>)}
        </section>}

        {page === "body-scan" && <section className="scan-panel page-panel" aria-label="Body scan">
          <div className="panel-heading"><div><div className="eyebrow">CREW OVERVIEW</div><h2>Explore by system</h2><p>Select an area to explore your health.</p></div><span className="outline-label">SIMULATED</span></div>
          {hazardControl}
          <div className="model-picker"><div><span>PROFILE BODY VIEW</span><small>{activeCrew.name} · illustrative front view · simulated readings</small></div><a href="#crew" className="crew-inline-link">Change profile →</a></div>
          <div className="scan-content"><div className="scan-figure"><div className="scan-orbit orbit-one" /><div className="scan-orbit orbit-two" /><BodyScan model={activeCrew.model} summaries={summaries} selected={selected} highlighted={hovered} filter={hazard} onSelect={setSelected} /><div className="scan-caption"><span className="status-pulse" /> INTERACTIVE BODY MAP <span> / </span> SELECT A REGION</div></div><div className="region-list"><div className="region-list-heading"><span>BODY SYSTEMS</span><span>STATUS</span></div>{[...left, ...right].map(card)}</div></div>
          <div ref={detailRef}>{selected && regionInHazard(selected, hazard) && <RegionDetail regionId={selected} summary={summaries[selected]} history={history} links={links} pantry={supplies.pantry} devices={devices} dismissedNudges={dismissed} onDismissNudge={dismissNudge} onCheckIn={logCheckIn} onEat={(id) => setSupplies((s) => eatMeal(s, id))} crewName={activeCrew.name} workouts={workouts} clock={clock} onAddWorkout={logWorkout} onRemoveWorkout={removeWorkout} />}</div>
        </section>}

        {page === "crew" && <CrewProfilesPage activeId={activeCrew.id} onSelect={selectCrew} />}
        {page === "check-ins" && <CheckInsPage key={activeCrew.id} name={activeCrew.name} clock={clock} entries={checkIns} devices={devices} onCheckIn={logCheckIn} />}
        {page === "emergency" && <EmergencyPage />}
        {page === "messages" && <CrewMessagesPage messages={crew.messages} clock={clock} comms={comms} />}
        {page === "alerts" && <CrewAlertsPage key={activeCrew.id} workspace={crew} clock={clock} comms={comms} />}
        {page === "medications" && <MedicationPage key={activeCrew.id} activeId={activeCrew.id} record={crew.records[activeCrew.id]} clock={clock} onAdd={saveMedication} onMark={markMedication} />}
        {page === "mission-settings" && <div className="page-tools" id="mission-settings"><EnvironmentBar env={env} missionDay={day + 1} onEnvChange={changeEnvironment} onDelayChange={setDelaySec} onBlackoutChange={changeBlackout} /><p className="page-note">These settings affect every decision in the simulation. <a href="#decisions">Review decisions →</a></p><details className="scenario-disclosure" open={window.location.hash === "#scenario" ? true : undefined}><summary><span><strong>Simulation &amp; scenarios</strong><small>{getScenario(scenarioId).name} · Day {day + 1} · {clock.playing ? "Clock running" : "Clock paused"}</small></span><span className="scenario-chevron" aria-hidden="true">⌄</span></summary><ScenarioBar scenarioId={scenarioId} clock={clock} onScenario={chooseScenario} onTogglePlay={() => setClock((c) => (c.playing ? pause(c) : play(c)))} onNextDay={() => setClock((c) => jumpToDay(c, missionDay(c) + 1))} onSpeed={(speed) => setClock((c) => ({ ...c, speed }))} onReset={resetDemo} /></details></div>}
        {page === "mission-risks" && <MissionRisks mission={envId} onMissionChange={changeEnvironment} />}
        {page === "trends" && <div className="page-tools"><TrendWatch trends={trends} carded={new Set(entries.map((e) => e.rule.indicator))} /><HazardTabs value={hazard} onChange={setHazard} /><CabinStrip co2MmHg={history.co2[history.co2.length - 1]} co2SensorDown={devices.co2_sensor === false} /><CompareChart history={history} /></div>}
        {page === "research" && <ResearchPage />}
        {page === "ledger" && <div className="page-tools"><Ledger entries={ledger} clock={clock} nowISO={now} onReview={surgeonReview} /></div>}
        {page === "resources" && <ResourcesPage devices={devices} supplies={supplies} day={day} onToggle={(id) => setDevices((d) => ({ ...d, [id]: d[id] === false }))} onEat={(id) => setSupplies((s) => eatMeal(s, id))} />}
        <footer className="site-footer"><span>DECISION WINDOW <span className="footer-dot">✳</span> CREW HEALTH SYSTEMS</span><span>Prototype, not a medical device. Mission demo data is simulated; research data is historical.</span></footer>
      </main>
    </div>
  );
}
