import {
  Bell,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Pill,
  Scale,
  ScanHeart,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavPage =
  | "overview"
  | "decisions"
  | "body-scan"
  | "check-ins"
  | "trends"
  | "crew"
  | "messages"
  | "alerts"
  | "medications"
  | "ledger"
  | "resources"
  | "mission-settings"
  | "mission-risks"
  | "research";

export interface NavItem {
  page: NavPage;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Navigation grouped the way crews work: act now, look after people, run the mission, learn. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Health",
    items: [
      { page: "overview", label: "Overview", icon: LayoutDashboard },
      { page: "decisions", label: "Decisions", icon: Scale },
      { page: "body-scan", label: "Body scan", icon: ScanHeart },
      { page: "check-ins", label: "Daily check-ins", icon: ClipboardCheck },
      { page: "trends", label: "Trends & hazards", icon: TrendingUp },
    ],
  },
  {
    label: "Crew",
    items: [
      { page: "crew", label: "Crew profiles", icon: Users },
      { page: "messages", label: "Messages", icon: MessagesSquare },
      { page: "alerts", label: "Notices", icon: Bell },
      { page: "medications", label: "Medication log", icon: Pill },
    ],
  },
  {
    label: "Mission",
    items: [
      { page: "ledger", label: "Decision ledger", icon: ScrollText },
      { page: "resources", label: "Equipment & supplies", icon: Package },
      { page: "mission-risks", label: "Mission risks", icon: ShieldAlert },
      { page: "mission-settings", label: "Mission settings", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Science",
    items: [{ page: "research", label: "NASA research data", icon: FlaskConical }],
  },
];

export function groupOf(page: string): string {
  return NAV_GROUPS.find((g) => g.items.some((i) => i.page === page))?.label ?? "Health";
}
