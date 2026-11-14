import {
  Activity,
  AudioLines,
  Bone,
  Brain,
  Droplet,
  Ear,
  Eye,
  Gauge,
  HeartPulse,
  Moon,
  Pill,
  Radiation,
  ShieldPlus,
  Smile,
  Star,
  Thermometer,
  Utensils,
  Weight,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

/**
 * Visual identity for each indicator and body system: an icon and a colour.
 * Identity colours avoid the status greens, ambers and reds, which stay reserved for status.
 */
export interface Identity {
  icon: LucideIcon;
  color: string;
}

export const INDICATOR_IDENTITY: Record<string, Identity> = {
  bp_systolic: { icon: HeartPulse, color: "#fb7185" },
  hr: { icon: Activity, color: "#f472b6" },
  glucose: { icon: Droplet, color: "#fda4af" },
  temp: { icon: Thermometer, color: "#f9a8d4" },
  sleep: { icon: Moon, color: "#818cf8" },
  mood: { icon: Smile, color: "#a78bfa" },
  stress: { icon: Zap, color: "#c4b5fd" },
  dose_daily: { icon: Radiation, color: "#e879f9" },
  eyes_score: { icon: Eye, color: "#38bdf8" },
  co2: { icon: Wind, color: "#7dd3fc" },
  meals_eaten: { icon: Utensils, color: "#bef264" },
  b_vitamin_count: { icon: Pill, color: "#d9f99d" },
  body_mass: { icon: Weight, color: "#a5f3fc" },
  meal_rating: { icon: Star, color: "#e9d5ff" },
  pressure: { icon: Gauge, color: "#c4b5fd" },
  noise: { icon: AudioLines, color: "#a5b4fc" },
};

export const REGION_IDENTITY: Record<string, Identity> = {
  head: { icon: Brain, color: "#a78bfa" },
  eyes: { icon: Eye, color: "#38bdf8" },
  ear: { icon: Ear, color: "#22d3ee" },
  heart: { icon: HeartPulse, color: "#fb7185" },
  immune: { icon: ShieldPlus, color: "#5eead4" },
  radiation: { icon: Radiation, color: "#e879f9" },
  stomach: { icon: Utensils, color: "#bef264" },
  skin: { icon: Thermometer, color: "#f9a8d4" },
  bones: { icon: Bone, color: "#e2e8f0" },
};

const FALLBACK: Identity = { icon: Activity, color: "#94a3b8" };

/** A small tinted tile holding the identity icon. Decorative: the label next to it carries the meaning. */
export function IdentityIcon({
  identity,
  size = 32,
  className = "",
}: {
  identity?: Identity;
  size?: number;
  className?: string;
}) {
  const { icon: Icon, color } = identity ?? FALLBACK;
  return (
    <span
      className={`dw-id-icon ${className}`}
      aria-hidden="true"
      style={{ "--id-color": color, width: size, height: size } as CSSProperties}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={1.9} />
    </span>
  );
}

export const IndicatorIcon = ({ id, size, className }: { id: string; size?: number; className?: string }) => (
  <IdentityIcon identity={INDICATOR_IDENTITY[id]} size={size} className={className} />
);

export const RegionIcon = ({ id, size, className }: { id: string; size?: number; className?: string }) => (
  <IdentityIcon identity={REGION_IDENTITY[id]} size={size} className={className} />
);
