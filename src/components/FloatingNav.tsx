import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark";
import { navLinks } from "../lib/navLinks";
import { AGENT, SMS_HREF } from "../config/agent";

export default function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const { pathname } = useLocation();

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const next = window.scrollY > 40;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "glass-deep glass-nav border-b border-white/10 py-2.5 md:py-3"
          : "border-b border-transparent py-4 md:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          className={`flex items-center gap-3 transition-transform duration-500 ${
            scrolled ? "origin-left scale-[0.92]" : "scale-100"
          }`}
          aria-label={`${AGENT.name} — home`}
        >
          <BrandMark />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[15px] text-mist-100">{AGENT.name}</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-gold">
              {AGENT.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "text-gold" : "text-mist-200 hover:text-gold"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={SMS_HREF}
            className="btn-plum whitespace-nowrap px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] md:px-6"
            data-magnetic
          >
            ✦ <span className="hidden sm:inline">Text </span>Raegan
          </a>
        </div>
      </div>
    </header>
  );
}
