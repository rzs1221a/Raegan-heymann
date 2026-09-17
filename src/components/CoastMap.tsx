/**
 * Stylized aerial / satellite rendering of the coast from Camden County, GA
 * down to St. Augustine, FL. Painterly and intentionally schematic — built to
 * be replaced by MapLibre / Esri imagery later without changing layout.
 *
 * Geography (top to bottom): Georgia mainland and St. Marys, the St. Marys
 * River, Cumberland Island offshore, Amelia Island with Crane Island on its
 * river side, the Nassau mainland (Yulee / Wildlight), the St. Johns River
 * mouth, the Jacksonville Beaches strip, and St. Augustine at the south.
 */
export default function CoastMap({
  className = "",
  drift = false,
}: {
  className?: string;
  drift?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 1200"
        preserveAspectRatio="xMidYMid slice"
        className={`h-full w-full ${drift ? "aerial-drift" : ""}`}
      >
        <defs>
          <linearGradient id="oceanDepth" x1="0" y1="0" x2="1" y2="0.25">
            <stop offset="0%" stopColor="#0B2A34" />
            <stop offset="55%" stopColor="#0A2530" />
            <stop offset="100%" stopColor="#071C24" />
          </linearGradient>
          <linearGradient id="landTone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d2b14" />
            <stop offset="60%" stopColor="#16230f" />
            <stop offset="100%" stopColor="#121d0d" />
          </linearGradient>
          <linearGradient id="marshTone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(79,105,28,0.55)" />
            <stop offset="100%" stopColor="rgba(67,91,23,0.35)" />
          </linearGradient>
          <radialGradient id="glow" cx="0.62" cy="0.22" r="0.8">
            <stop offset="0%" stopColor="rgba(200,209,194,0.10)" />
            <stop offset="45%" stopColor="rgba(200,209,194,0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <pattern id="marshDots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="4" r="1.1" fill="rgba(180,200,120,0.20)" />
            <circle cx="10" cy="11" r="0.9" fill="rgba(160,185,105,0.16)" />
          </pattern>
          <pattern id="canopyDots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="6" r="2.2" fill="rgba(60,85,30,0.5)" />
            <circle cx="15" cy="15" r="1.8" fill="rgba(50,75,26,0.45)" />
          </pattern>
        </defs>

        {/* Ocean */}
        <rect width="1000" height="1200" fill="url(#oceanDepth)" />

        {/* Offshore depth contours */}
        <g fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.4">
          <path d="M730 -20 Q700 300 760 620 Q800 900 740 1220" />
          <path d="M820 -20 Q790 320 850 640 Q890 920 830 1220" />
          <path d="M910 -20 Q885 340 935 660 Q970 940 915 1220" />
        </g>

        {/* Georgia + Florida mainland */}
        <path
          d="M0 0 L430 0
             Q470 40 440 90 Q400 130 430 165
             L380 175 Q330 195 360 230
             Q420 250 400 300 Q360 340 410 380
             Q470 420 430 470 Q380 510 440 560
             Q500 590 470 640
             Q430 690 480 730 Q530 760 500 820
             Q460 880 510 940 Q550 990 520 1050
             Q490 1110 540 1160 L520 1200 L0 1200 Z"
          fill="url(#landTone)"
        />
        <path
          d="M0 0 L430 0 Q470 40 440 90 Q400 130 430 165 L380 175 Q330 195 360 230 Q420 250 400 300 Q360 340 410 380 Q470 420 430 470 Q380 510 440 560 Q500 590 470 640 Q430 690 480 730 Q530 760 500 820 Q460 880 510 940 Q550 990 520 1050 Q490 1110 540 1160 L520 1200 L0 1200 Z"
          fill="url(#canopyDots)"
          opacity="0.5"
        />

        {/* St. Marys River cut (GA / FL line) */}
        <path
          d="M0 178 Q160 168 300 188 Q420 206 560 196"
          fill="none"
          stroke="#0B2A34"
          strokeWidth="26"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Marsh between mainland and islands */}
        <g>
          <path
            d="M430 120 Q500 160 480 230 Q455 300 500 360 Q540 420 505 480 Q470 540 520 580 L560 560 Q530 480 565 420 Q600 350 560 280 Q520 210 555 150 Q570 110 540 70 Z"
            fill="url(#marshTone)"
          />
          <path
            d="M430 120 Q500 160 480 230 Q455 300 500 360 Q540 420 505 480 Q470 540 520 580 L560 560 Q530 480 565 420 Q600 350 560 280 Q520 210 555 150 Q570 110 540 70 Z"
            fill="url(#marshDots)"
          />
          <path
            d="M470 640 Q540 660 560 720 Q575 770 545 820 L505 800 Q530 750 510 710 Q495 675 455 665 Z"
            fill="url(#marshTone)"
            opacity="0.8"
          />
        </g>

        {/* Amelia River channel */}
        <path
          d="M520 150 Q505 230 525 300 Q545 380 515 460 Q495 520 530 580"
          fill="none"
          stroke="#0A2530"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Cumberland Island (GA) */}
        <path
          d="M600 -10 Q640 30 632 90 Q626 140 600 175 Q580 150 584 95 Q586 40 575 0 Z"
          fill="url(#landTone)"
        />
        <path
          d="M600 -10 Q640 30 632 90 Q626 140 600 175 Q580 150 584 95 Q586 40 575 0 Z"
          fill="url(#marshDots)"
          opacity="0.7"
        />

        {/* Amelia Island */}
        <path
          d="M560 200 Q625 215 645 280 Q662 340 650 400 Q638 455 600 490 Q570 460 568 400 Q565 340 552 290 Q542 240 560 200 Z"
          fill="url(#landTone)"
        />
        <path
          d="M560 200 Q625 215 645 280 Q662 340 650 400 Q638 455 600 490 Q570 460 568 400 Q565 340 552 290 Q542 240 560 200 Z"
          fill="url(#canopyDots)"
          opacity="0.55"
        />
        {/* Beach edge on Amelia's ocean side */}
        <path
          d="M645 280 Q662 340 650 400 Q638 455 600 490"
          fill="none"
          stroke="rgba(216,201,170,0.55)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M560 200 Q625 215 645 280"
          fill="none"
          stroke="rgba(216,201,170,0.4)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Crane Island — river side of Amelia */}
        <path
          d="M508 268 Q532 262 540 286 Q546 308 528 320 Q508 328 498 308 Q492 284 508 268 Z"
          fill="url(#landTone)"
        />
        <path
          d="M508 268 Q532 262 540 286 Q546 308 528 320 Q508 328 498 308 Q492 284 508 268 Z"
          fill="url(#marshDots)"
          opacity="0.9"
        />

        {/* Fernandina street grid hint */}
        <g stroke="rgba(244,247,242,0.10)" strokeWidth="1.6">
          <path d="M560 215 L600 225" />
          <path d="M558 228 L598 238" />
          <path d="M556 241 L596 251" />
          <path d="M566 208 L558 248" />
          <path d="M580 212 L572 252" />
          <path d="M594 216 L586 256" />
        </g>

        {/* St. Johns River mouth */}
        <path
          d="M0 600 Q200 590 380 605 Q500 615 590 600 Q640 592 700 605"
          fill="none"
          stroke="#0B2A34"
          strokeWidth="34"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Jacksonville Beaches barrier strip */}
        <path
          d="M540 640 Q580 700 575 780 Q572 850 555 910 Q540 880 542 810 Q545 740 532 690 Z"
          fill="url(#landTone)"
        />
        <path
          d="M575 700 Q578 790 558 895"
          fill="none"
          stroke="rgba(216,201,170,0.5)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Guana / Tolomato river lagoon */}
        <path
          d="M520 660 Q540 760 528 880 Q520 960 540 1040"
          fill="none"
          stroke="#0A2530"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Anastasia Island + St. Augustine inlet */}
        <path
          d="M545 1075 Q590 1090 600 1140 Q605 1180 585 1210 L548 1210 Q540 1160 535 1120 Z"
          fill="url(#landTone)"
        />
        <path
          d="M598 1120 Q606 1170 588 1208"
          fill="none"
          stroke="rgba(216,201,170,0.45)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M460 1065 Q520 1058 575 1072"
          fill="none"
          stroke="#0B2A34"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* I-95 corridor hint */}
        <path
          d="M250 0 Q230 300 270 600 Q310 900 280 1200"
          fill="none"
          stroke="rgba(244,247,242,0.06)"
          strokeWidth="3"
        />
        {/* A1A hint */}
        <path
          d="M560 210 Q585 350 600 480 M548 650 Q565 800 552 920 M540 1000 Q545 1080 555 1180"
          fill="none"
          stroke="rgba(244,247,242,0.05)"
          strokeWidth="2.4"
        />

        {/* Wave lines near shore */}
        <g fill="none" stroke="rgba(244,247,242,0.06)" strokeWidth="1.6">
          <path d="M668 270 Q686 350 672 430" />
          <path d="M598 700 Q604 790 584 900" />
          <path d="M622 1110 Q630 1165 612 1212" />
        </g>

        {/* Atmosphere */}
        <rect width="1000" height="1200" fill="url(#glow)" />
        <rect width="1000" height="1200" fill="rgba(7,28,36,0.18)" />
      </svg>
    </div>
  );
}
