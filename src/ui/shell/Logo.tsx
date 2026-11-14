/**
 * Decision Window mark: a rounded "window" with a planet horizon and a pulse line that
 * crosses it. Original artwork for this project.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="dw-logo-mark">
      <defs>
        <linearGradient id="dw-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <clipPath id="dw-logo-clip">
          <rect x="1" y="1" width="30" height="30" rx="8" />
        </clipPath>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#dw-logo-bg)" />
      <g clipPath="url(#dw-logo-clip)">
        <circle cx="16" cy="44" r="22" fill="#0b1220" opacity="0.55" />
        <circle cx="24.5" cy="8" r="2.4" fill="#ffffff" opacity="0.9" />
      </g>
      <path
        d="M4.5 18.5h6l2.2-5 3.2 9.5 3.2-13 2.4 8.5h6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="dw-logo">
      <LogoMark />
      {!compact && (
        <span className="dw-logo-text">
          <strong>Decision Window</strong>
          <small>Crew health · Mission ops</small>
        </span>
      )}
    </span>
  );
}
