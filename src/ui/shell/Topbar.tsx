import { Bell, ChevronDown, Menu, Pause, Play, Siren, Wifi, WifiOff } from "lucide-react";
import { CREW, type CrewId } from "../../data/crew";
import type { Environment } from "../../engine/types";
import { earthReplyMin } from "../../engine/verdict";
import { missionTimeLabel, nowISO, type ClockState } from "../../state/clock";
import { ENV_META, formatDelay } from "./envMeta";

interface Props {
  group: string;
  title: string;
  env: Environment;
  clock: ClockState;
  activeCrew: { id: CrewId; name: string; role: string };
  unreadAlerts: number;
  onTogglePlay: () => void;
  onSelectCrew: (id: CrewId) => void;
  onOpenMenu: () => void;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

/** Global context bar: where the crew is, whether the link is up, the mission clock and who is viewing. */
export function Topbar({
  group,
  title,
  env,
  clock,
  activeCrew,
  unreadAlerts,
  onTogglePlay,
  onSelectCrew,
  onOpenMenu,
}: Props) {
  const meta = ENV_META[env.id];
  const EnvIcon = meta.icon;
  const reply = earthReplyMin(env.oneWayDelaySec);
  const time = missionTimeLabel(clock, nowISO(clock));

  return (
    <header className="dw-topbar">
      <button type="button" className="dw-icon-btn dw-menu-btn" onClick={onOpenMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <nav className="dw-breadcrumb" aria-label="Breadcrumb">
        <span>{group}</span>
        <span aria-hidden="true">/</span>
        <strong>{title}</strong>
      </nav>

      <div className="dw-context">
        <a href="#mission-settings" className="dw-chip" title="Environment and communication delay">
          <EnvIcon size={15} aria-hidden="true" />
          <span className="dw-chip-main">{meta.label}</span>
          <span className="dw-chip-sub">
            {formatDelay(env.oneWayDelaySec)} one-way · Earth reply ≈ {Math.round(reply)} min
          </span>
        </a>

        <a
          href="#mission-settings"
          className={`dw-chip ${env.blackout ? "dw-chip-danger" : "dw-chip-ok"}`}
          title="Link to Earth"
        >
          {env.blackout ? <WifiOff size={15} aria-hidden="true" /> : <Wifi size={15} aria-hidden="true" />}
          <span className="dw-chip-main">{env.blackout ? "Blackout" : "Link up"}</span>
        </a>

        <div className="dw-chip dw-clock" title="Simulated mission clock">
          <span className="dw-chip-main dw-mono">{time}</span>
          <button
            type="button"
            className="dw-clock-btn"
            onClick={onTogglePlay}
            aria-label={clock.playing ? "Pause mission clock" : "Run mission clock"}
          >
            {clock.playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>

        <a href="#alerts" className="dw-icon-btn dw-bell" aria-label={`Crew notices, ${unreadAlerts} unread`}>
          <Bell size={18} />
          {unreadAlerts > 0 && <span className="dw-bell-dot">{unreadAlerts}</span>}
        </a>

        <label className="dw-crew-switch" title="Switch simulated crew profile">
          <span className="dw-avatar" aria-hidden="true">
            {initials(activeCrew.name)}
          </span>
          <span className="dw-crew-text">
            <strong>{activeCrew.name}</strong>
            <small>{activeCrew.role}</small>
          </span>
          <ChevronDown size={14} aria-hidden="true" className="dw-crew-chevron" />
          <select
            value={activeCrew.id}
            onChange={(e) => onSelectCrew(e.target.value as CrewId)}
            aria-label="Viewing crew profile"
          >
            {CREW.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.role}
              </option>
            ))}
          </select>
        </label>

        <a href="#emergency" className="dw-emergency-btn">
          <Siren size={16} aria-hidden="true" />
          <span>Emergency</span>
        </a>
      </div>
    </header>
  );
}
