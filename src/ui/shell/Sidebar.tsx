import { ChevronsLeft, ChevronsRight, Siren, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_GROUPS, type NavPage } from "./nav";
import { ENV_META } from "./envMeta";
import type { Environment } from "../../engine/types";

interface Props {
  page: string;
  collapsed: boolean;
  mobileOpen: boolean;
  badges: Partial<Record<NavPage, number>>;
  env: Environment;
  missionDay: number;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

/** Primary navigation. Collapses to icons on desktop and becomes a drawer on small screens. */
export function Sidebar({
  page,
  collapsed,
  mobileOpen,
  badges,
  env,
  missionDay,
  onToggleCollapsed,
  onCloseMobile,
}: Props) {
  const meta = ENV_META[env.id];
  const MissionIcon = meta.icon;
  return (
    <aside
      className={`dw-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-open" : ""}`}
      aria-label="Primary"
    >
      <div className="dw-sidebar-top">
        <a href="#overview" className="dw-brand" aria-label="Decision Window, overview" onClick={onCloseMobile}>
          <Logo compact={collapsed} />
        </a>
        <button
          type="button"
          className="dw-icon-btn dw-collapse-btn"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
        <button type="button" className="dw-icon-btn dw-drawer-close" onClick={onCloseMobile} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <a href="#mission-settings" className="dw-mission-switch" onClick={onCloseMobile} title="Mission settings">
        <span className="dw-mission-icon" aria-hidden="true">
          <MissionIcon size={16} />
        </span>
        <span className="dw-mission-text">
          <small>Active mission · simulated</small>
          <strong>{meta.mission}</strong>
          <span>
            {meta.label} · Day {missionDay}
          </span>
        </span>
      </a>

      <nav className="dw-nav" aria-label="Main navigation" onClick={(e) => {
        if (e.target instanceof Element && e.target.closest("a")) onCloseMobile();
      }}>
        {NAV_GROUPS.map((group) => (
          <div className="dw-nav-group" key={group.label}>
            <div className="dw-nav-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const count = badges[item.page] ?? 0;
              const current = page === item.page;
              return (
                <a
                  key={item.page}
                  href={`#${item.page}`}
                  className="dw-nav-item"
                  aria-current={current ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  aria-label={count > 0 ? `${item.label}, ${count}` : item.label}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span className="dw-nav-text">{item.label}</span>
                  {count > 0 && <span className="dw-nav-badge">{count}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="dw-sidebar-bottom">
        <a href="#emergency" className="dw-emergency" onClick={onCloseMobile} aria-current={page === "emergency" ? "page" : undefined} title="Emergency support">
          <Siren size={18} aria-hidden="true" />
          <span className="dw-nav-text">Emergency support</span>
        </a>
        <div className="dw-system-status">
          <span className="dw-dot dw-dot-ok" aria-hidden="true" />
          <span className="dw-nav-text">Offline-ready · simulation</span>
        </div>
      </div>
    </aside>
  );
}
