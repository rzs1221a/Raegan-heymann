import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { tabHaptic } from "../lib/haptics";

/**
 * Native-app bottom tab bar — island, homes, areas, sell, and a More tab for
 * the rest. Hidden on desktop (`lg:hidden`), where the top nav rules.
 *
 * A single gold indicator slides between tabs (transform-only) so switching
 * sections reads like a native dock rather than a row of links.
 */

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5",
  // Folded map with a pin — reads as "areas" / places rather than buildings.
  areas:
    "M9 4 3 6.5v13L9 17m0-13 6 3m-6-3v13m6-10 6-2.5v13L15 20m0-13v13m0 0-6-3M16 8.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z",
  agents:
    "M16 19.5c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 20c0-1.7-.9-3.2-2.3-4M5 20c0-1.7.9-3.2 2.3-4",
  market: "M4 19V5m0 14h16M8 16V9m4 7V6m4 10v-4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  // A compass rose — the island, read from above.
  island: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z",
} as const;

const TABS: { to: string; label: string; icon: keyof typeof ICONS; end?: boolean }[] =
  [
    { to: "/", label: "Island", icon: "island", end: true },
    { to: "/listings", label: "Homes", icon: "home" },
    { to: "/neighborhoods", label: "Areas", icon: "areas" },
    { to: "/sell", label: "Sell", icon: "market" },
  ];

const TAB_COUNT = TABS.length + 1; // + More

function Tab({
  active,
  onClick,
  to,
  end,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  to?: string;
  end?: boolean;
  children: ReactNode;
}) {
  const cls = (isActive: boolean) =>
    `mobile-tab flex h-full min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-[0.08em] transition-[color,transform] duration-200 active:scale-[0.92] ${
      isActive ? "text-gold is-active" : "text-mist-300"
    }`;
  if (to) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={tabHaptic}
        className={({ isActive }) => cls(isActive)}
      >
        {children}
      </NavLink>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        tabHaptic();
        onClick?.();
      }}
      className={cls(!!active)}
    >
      {children}
    </button>
  );
}

/** Which dock slot is active, or -1 when the route isn't one of the tabs. */
function activeIndex(pathname: string, moreActive: boolean): number {
  if (moreActive) return TABS.length;
  const i = TABS.findIndex((t) =>
    t.end ? pathname === t.to : pathname === t.to || pathname.startsWith(`${t.to}/`)
  );
  return i;
}

export default function MobileTabBar({
  onMore,
  moreActive,
}: {
  onMore: () => void;
  moreActive?: boolean;
}) {
  const { pathname } = useLocation();
  const index = activeIndex(pathname, !!moreActive);
  const widthPct = 100 / TAB_COUNT;

  return (
    <nav
      className="glass-deep glass-nav fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <span
        aria-hidden="true"
        className="mobile-tab-indicator"
        style={{
          width: `${widthPct}%`,
          transform: `translateX(${index * 100}%)`,
          opacity: index < 0 ? 0 : 1,
        }}
      />
      {TABS.map((t) => (
        <Tab key={t.to} to={t.to} end={t.end}>
          <Icon d={ICONS[t.icon]} />
          {t.label}
        </Tab>
      ))}
      <Tab active={moreActive} onClick={onMore}>
        <Icon d={ICONS.more} />
        More
      </Tab>
    </nav>
  );
}
