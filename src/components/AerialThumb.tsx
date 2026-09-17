import type { ThumbVariant } from "../data/communities";

/**
 * Generative stylized aerial thumbnail. Stands in for real aerial imagery so
 * every card stays inside one visual system; swap for photography or map
 * tiles later without touching card layout.
 */
export default function AerialThumb({
  variant,
  className = "",
}: {
  variant: ThumbVariant | string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={`w-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3340" />
            <stop offset="100%" stopColor="#071C24" />
          </linearGradient>
          <linearGradient id={`l-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22311a" />
            <stop offset="100%" stopColor="#141f0e" />
          </linearGradient>
          <pattern
            id={`d-${variant}`}
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="5" r="1.6" fill="rgba(170,195,110,0.25)" />
            <circle cx="12" cy="13" r="1.2" fill="rgba(150,180,95,0.2)" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill={`url(#w-${variant})`} />
        {renderScene(variant)}
        <rect width="400" height="240" fill="rgba(7,28,36,0.16)" />
      </svg>
    </div>
  );

  function renderScene(v: string) {
    switch (v) {
      case "marsh":
        return (
          <g>
            <path
              d="M0 0 H400 V240 H0 Z"
              fill={`url(#l-${variant})`}
              opacity="0.9"
            />
            <rect width="400" height="240" fill={`url(#d-${variant})`} />
            <path
              d="M-20 60 Q90 90 160 50 Q250 10 330 70 Q380 105 430 80"
              fill="none"
              stroke="#0E3340"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M-20 170 Q80 140 170 180 Q260 220 350 175 Q390 155 430 170"
              fill="none"
              stroke="#0E3340"
              strokeWidth="34"
              strokeLinecap="round"
            />
            <path
              d="M130 100 Q170 130 150 165"
              fill="none"
              stroke="#0E3340"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
        );
      case "beach":
        return (
          <g>
            <path d="M0 0 H190 Q230 120 180 240 H0 Z" fill={`url(#l-${variant})`} />
            <path
              d="M0 0 H190 Q230 120 180 240 H0 Z"
              fill={`url(#d-${variant})`}
              opacity="0.7"
            />
            <path
              d="M190 0 Q230 120 180 240 L225 240 Q272 120 232 0 Z"
              fill="rgba(216,201,170,0.65)"
            />
            <g stroke="rgba(244,247,242,0.16)" strokeWidth="3" fill="none">
              <path d="M268 10 Q296 120 262 232" />
              <path d="M310 6 Q340 120 304 236" />
            </g>
          </g>
        );
      case "harbor":
        return (
          <g>
            <path d="M0 0 H400 V100 Q300 130 220 110 Q120 85 0 120 Z" fill={`url(#l-${variant})`} />
            <g stroke="rgba(244,247,242,0.14)" strokeWidth="3">
              <path d="M40 20 L120 40" />
              <path d="M36 44 L116 64" />
              <path d="M60 12 L48 70" />
              <path d="M92 18 L80 76" />
            </g>
            <g stroke="rgba(216,201,170,0.5)" strokeWidth="4" strokeLinecap="round">
              <path d="M150 118 L150 168" />
              <path d="M210 112 L210 158" />
              <path d="M265 120 L265 172" />
            </g>
            <g fill="rgba(244,247,242,0.4)">
              <ellipse cx="170" cy="185" rx="9" ry="3.4" />
              <ellipse cx="240" cy="196" rx="11" ry="3.8" />
              <ellipse cx="305" cy="180" rx="8" ry="3" />
            </g>
          </g>
        );
      case "golf":
        return (
          <g>
            <rect width="400" height="240" fill={`url(#l-${variant})`} />
            <rect width="400" height="240" fill={`url(#d-${variant})`} />
            <path
              d="M40 220 Q90 130 180 150 Q280 170 340 80 Q360 50 350 20"
              fill="none"
              stroke="rgba(120,150,60,0.55)"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <circle cx="345" cy="32" r="14" fill="rgba(150,180,85,0.6)" />
            <ellipse cx="120" cy="180" rx="12" ry="7" fill="rgba(216,201,170,0.55)" />
            <ellipse cx="250" cy="140" rx="10" ry="6" fill="rgba(216,201,170,0.5)" />
            <path
              d="M-10 60 Q60 80 50 130"
              fill="none"
              stroke="#0E3340"
              strokeWidth="20"
              strokeLinecap="round"
            />
          </g>
        );
      case "grid":
        return (
          <g>
            <rect width="400" height="240" fill={`url(#l-${variant})`} />
            <g stroke="rgba(244,247,242,0.14)" strokeWidth="3.5">
              {[30, 90, 150, 210].map((y) => (
                <path key={y} d={`M-10 ${y} L410 ${y + 24}`} />
              ))}
              {[60, 140, 220, 300, 380].map((x) => (
                <path key={x} d={`M${x} -10 L${x - 18} 250`} />
              ))}
            </g>
            <g fill="rgba(170,195,110,0.18)">
              <rect x="78" y="44" width="52" height="40" rx="4" transform="rotate(4 104 64)" />
              <rect x="232" y="104" width="56" height="42" rx="4" transform="rotate(4 260 125)" />
            </g>
            <rect
              x="152"
              y="98"
              width="58"
              height="44"
              rx="4"
              fill="rgba(163,58,143,0.30)"
              stroke="rgba(163,58,143,0.8)"
              strokeWidth="2"
              transform="rotate(4 181 120)"
            />
          </g>
        );
      case "river":
        return (
          <g>
            <rect width="400" height="240" fill={`url(#l-${variant})`} />
            <rect width="400" height="240" fill={`url(#d-${variant})`} opacity="0.8" />
            <path
              d="M-20 130 Q90 70 200 120 Q310 170 420 110"
              fill="none"
              stroke="#0E3340"
              strokeWidth="62"
              strokeLinecap="round"
            />
            <path
              d="M150 96 L150 128 M250 142 L250 168"
              stroke="rgba(216,201,170,0.55)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        );
      case "dunes":
        return (
          <g>
            <path d="M0 0 H230 Q260 120 220 240 H0 Z" fill={`url(#l-${variant})`} />
            <path
              d="M0 0 H230 Q260 120 220 240 H0 Z"
              fill={`url(#d-${variant})`}
            />
            <path
              d="M230 0 Q260 120 220 240 L268 240 Q304 120 272 0 Z"
              fill="rgba(216,201,170,0.6)"
            />
            <g fill="rgba(170,195,110,0.3)">
              <circle cx="246" cy="60" r="4" />
              <circle cx="252" cy="120" r="3.4" />
              <circle cx="242" cy="180" r="4.2" />
            </g>
            <path
              d="M315 4 Q345 120 308 238"
              fill="none"
              stroke="rgba(244,247,242,0.15)"
              strokeWidth="3"
            />
          </g>
        );
      case "canopy":
      default:
        return (
          <g>
            <rect width="400" height="240" fill={`url(#l-${variant})`} />
            <rect width="400" height="240" fill={`url(#d-${variant})`} />
            <path
              d="M-10 190 Q90 150 160 170 Q240 192 290 150 Q330 116 410 130"
              fill="none"
              stroke="rgba(244,247,242,0.16)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle
              cx="160"
              cy="170"
              r="17"
              fill="none"
              stroke="rgba(244,247,242,0.16)"
              strokeWidth="7"
            />
            <circle
              cx="290"
              cy="150"
              r="14"
              fill="none"
              stroke="rgba(244,247,242,0.14)"
              strokeWidth="6"
            />
            <g fill="rgba(216,201,170,0.30)">
              <rect x="120" y="120" width="14" height="10" rx="2" />
              <rect x="190" y="186" width="14" height="10" rx="2" />
              <rect x="262" y="112" width="14" height="10" rx="2" />
            </g>
          </g>
        );
    }
  }
}
