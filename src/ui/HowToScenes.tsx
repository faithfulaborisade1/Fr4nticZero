import type { SceneId } from "../data/howTo";

/*
 * Original line-art scenes for the how-to guides. Motion is plain CSS (see theme.css,
 * ".ht-*"), so it stops under reduced-motion settings. Purely illustrative.
 */

const LINE = "#c9d4e3";
const SOFT = "#5b6b82";
const ROSE = "#fb7185";
const PINK = "#fda4af";
const TEAL = "#2dd4bf";

function Arm({ cuff = false, inflate = false, label = true }: { cuff?: boolean; inflate?: boolean; label?: boolean }) {
  return (
    <g>
      {/* heart-level guide */}
      <line x1="20" y1="110" x2="340" y2="110" stroke={SOFT} strokeDasharray="5 6" />
      {label && <text x="236" y="84" fill={SOFT} fontSize="11">heart level</text>}
      {/* upper arm and forearm */}
      <rect x="40" y="92" width="170" height="36" rx="18" fill="#1b2433" stroke={LINE} strokeWidth="2" />
      <rect x="196" y="94" width="130" height="32" rx="16" fill="#1b2433" stroke={LINE} strokeWidth="2" />
      <circle cx="205" cy="110" r="5" fill={SOFT} />
      <text x="190" y="150" fill={SOFT} fontSize="11">elbow</text>
      {cuff && (
        <g className={inflate ? "ht-inflate" : "ht-slide-in"}>
          <rect x="112" y="84" width="76" height="52" rx="8" fill={ROSE} fillOpacity="0.22" stroke={ROSE} strokeWidth="2.5" />
          <line x1="150" y1="84" x2="150" y2="60" stroke={ROSE} strokeWidth="2.5" />
          <line x1="150" y1="60" x2="250" y2="60" stroke={ROSE} strokeWidth="2.5" />
        </g>
      )}
    </g>
  );
}

function Monitor({ children }: { children?: React.ReactNode }) {
  return (
    <g>
      <rect x="238" y="30" width="96" height="76" rx="10" fill="#111823" stroke={LINE} strokeWidth="2" />
      <rect x="248" y="40" width="76" height="46" rx="4" fill="#0b1018" stroke={SOFT} />
      <circle cx="286" cy="96" r="4" fill={TEAL} />
      {children}
    </g>
  );
}

function Finger({ x = 70 }: { x?: number }) {
  return (
    <g>
      <path
        d={`M${x} 210 L${x} 92 Q${x} 64 ${x + 26} 64 Q${x + 52} 64 ${x + 52} 92 L${x + 52} 210`}
        fill="#1b2433"
        stroke={LINE}
        strokeWidth="2"
      />
      <path d={`M${x + 12} 96 Q${x + 26} 88 ${x + 40} 96`} fill="none" stroke={SOFT} strokeWidth="1.5" />
    </g>
  );
}

function Meter({ x, y, screen }: { x: number; y: number; screen?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="92" height="120" rx="14" fill="#111823" stroke={LINE} strokeWidth="2" />
      <rect x="12" y="14" width="68" height="50" rx="5" fill="#0b1018" stroke={SOFT} />
      <rect x="34" y="-4" width="24" height="8" rx="2" fill={SOFT} />
      <circle cx="46" cy="92" r="11" fill="none" stroke={SOFT} strokeWidth="2" />
      {screen}
    </g>
  );
}

export function HowToScene({ id }: { id: SceneId }) {
  return (
    <svg viewBox="0 0 360 220" className="ht-svg" aria-hidden="true" focusable="false">
      {id === "bp-rest" && (
        <g>
          {/* handrail and foot loop */}
          <line x1="40" y1="205" x2="200" y2="205" stroke={SOFT} strokeWidth="3" />
          <rect x="88" y="196" width="34" height="12" rx="6" fill="none" stroke={SOFT} strokeWidth="2" />
          <g className="ht-breathe">
            <circle cx="105" cy="52" r="18" fill="#1b2433" stroke={LINE} strokeWidth="2" />
            <line x1="105" y1="70" x2="105" y2="140" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
            <path d="M105 88 L135 116 L172 116" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
            <path d="M105 88 L82 118" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
            <path d="M105 140 L94 200 M105 140 L116 200" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* five-minute timer */}
          <circle cx="268" cy="104" r="44" fill="none" stroke="#263245" strokeWidth="8" />
          <circle
            className="ht-timer"
            cx="268"
            cy="104"
            r="44"
            fill="none"
            stroke={ROSE}
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            transform="rotate(-90 268 104)"
          />
          <text x="268" y="102" textAnchor="middle" fill={LINE} fontSize="20" fontWeight="700">5 min</text>
          <text x="268" y="122" textAnchor="middle" fill={SOFT} fontSize="11">quiet rest</text>
        </g>
      )}

      {id === "bp-cuff" && (
        <g>
          <Arm cuff />
          <text x="112" y="172" fill={PINK} fontSize="11">lower edge just above the elbow</text>
        </g>
      )}

      {id === "bp-inflate" && (
        <g>
          <g transform="translate(-30 40)">
            <Arm cuff inflate label={false} />
          </g>
          <Monitor>
            <rect className="ht-gauge" x="254" y="46" width="64" height="34" rx="3" fill={ROSE} fillOpacity="0.35" />
            <text x="286" y="68" textAnchor="middle" fill={LINE} fontSize="12" fontWeight="700">measuring</text>
          </Monitor>
          <text x="40" y="204" fill={PINK} fontSize="12">don’t talk, stay still</text>
        </g>
      )}

      {id === "bp-log" && (
        <g>
          <rect x="40" y="34" width="150" height="120" rx="12" fill="#111823" stroke={LINE} strokeWidth="2" />
          <rect x="52" y="46" width="126" height="96" rx="6" fill="#0b1018" stroke={SOFT} />
          <text x="62" y="68" fill={SOFT} fontSize="11">SYS</text>
          <text x="168" y="88" textAnchor="end" fill={ROSE} fontSize="32" fontWeight="700">146</text>
          <text x="62" y="118" fill={SOFT} fontSize="11">DIA</text>
          <text x="168" y="130" textAnchor="end" fill={LINE} fontSize="20" fontWeight="600">88</text>
          <path className="ht-blink" d="M70 92 l4 -4 a4 4 0 0 1 6 6 l-6 6 l-6 -6 a4 4 0 0 1 6 -6" fill={ROSE} />
          {/* arrow to the log */}
          <path className="ht-appear d1" d="M200 94 H244 M236 86 l8 8 l-8 8" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g className="ht-appear d2">
            <rect x="254" y="54" width="86" height="80" rx="10" fill="#0f2a2c" stroke={TEAL} strokeWidth="2" />
            <text x="297" y="84" textAnchor="middle" fill={LINE} fontSize="13" fontWeight="700">Log</text>
            <text x="297" y="102" textAnchor="middle" fill={SOFT} fontSize="11">146 · 08:12</text>
            <path d="M284 116 l8 8 l14 -16" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="40" y="186" fill={SOFT} fontSize="11">Second reading about a minute later</text>
        </g>
      )}

      {id === "glu-wash" && (
        <g>
          <Finger x={140} />
          <g fill="#7dd3fc">
            <circle className="ht-drop" cx="132" cy="40" r="5" />
            <circle className="ht-drop d1" cx="168" cy="30" r="4" />
            <circle className="ht-drop d2" cx="204" cy="44" r="5" />
          </g>
          <path className="ht-appear d3" d="M222 70 l6 -12 l6 12 l-6 12 z" fill={TEAL} />
          <text x="40" y="198" fill={SOFT} fontSize="11">clean</text>
          <text x="40" y="216" fill={SOFT} fontSize="11">and dry</text>
        </g>
      )}

      {id === "glu-strip" && (
        <g>
          <Meter
            x={200}
            y={56}
            screen={
              <g className="ht-appear d2">
                <path d="M46 26 q-8 12 0 16 q8 -4 0 -16 z" fill={PINK} />
                <text x="46" y="58" textAnchor="middle" fill={LINE} fontSize="9">apply blood</text>
              </g>
            }
          />
          <g className="ht-strip-in">
            <rect x="234" y="-2" width="24" height="62" rx="3" fill="#e2e8f0" stroke={LINE} />
            <rect x="240" y="4" width="12" height="10" rx="2" fill={PINK} />
          </g>
          <text x="40" y="120" fill={SOFT} fontSize="11">unexpired strip</text>
          <text x="40" y="137" fill={SOFT} fontSize="11">for this meter</text>
        </g>
      )}

      {id === "glu-prick" && (
        <g>
          <Finger x={70} />
          <g className="ht-lancet">
            <rect x="140" y="80" width="90" height="26" rx="8" fill="#111823" stroke={LINE} strokeWidth="2" />
            <path d="M140 93 L126 93" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle className="ht-grow" cx="124" cy="104" r="8" fill={ROSE} />
          <text x="150" y="150" fill={SOFT} fontSize="11">side of the fingertip</text>
          <text x="150" y="166" fill={PINK} fontSize="11">the drop clings in weightlessness</text>
        </g>
      )}

      {id === "glu-touch" && (
        <g>
          <Finger x={60} />
          <circle className="ht-shrink" cx="114" cy="104" r="8" fill={ROSE} />
          <g className="ht-approach">
            <rect x="120" y="96" width="62" height="16" rx="3" fill="#e2e8f0" stroke={LINE} />
            <Meter x={182} y={50} screen={<text x="46" y="45" textAnchor="middle" fill={LINE} fontSize="12" className="ht-appear d2">reading…</text>} />
          </g>
        </g>
      )}

      {id === "glu-log" && (
        <g>
          <Meter
            x={40}
            y={46}
            screen={
              <g>
                <text x="46" y="42" textAnchor="middle" fill={LINE} fontSize="22" fontWeight="700">112</text>
                <text x="46" y="57" textAnchor="middle" fill={SOFT} fontSize="9">mg/dL</text>
              </g>
            }
          />
          {/* sharps container */}
          <path d="M226 110 h88 l-8 92 h-72 z" fill="#111823" stroke={ROSE} strokeWidth="2" />
          <rect x="220" y="98" width="100" height="14" rx="4" fill={ROSE} fillOpacity="0.3" stroke={ROSE} strokeWidth="2" />
          <text x="270" y="160" textAnchor="middle" fill={PINK} fontSize="11">sharps</text>
          <g className="ht-drop-in">
            <rect x="262" y="34" width="16" height="38" rx="4" fill="#e2e8f0" />
          </g>
          <path className="ht-appear d2" d="M150 100 l8 8 l16 -18" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="140" y="130" fill={SOFT} fontSize="11">log value,</text>
          <text x="140" y="147" fill={SOFT} fontSize="11">time and meal</text>
        </g>
      )}
    </svg>
  );
}
