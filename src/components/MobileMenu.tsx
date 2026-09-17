import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import MotionSurface from "./MotionSurface";
import { navLinks } from "../lib/navLinks";
import { AGENT, CELL_HREF, SMS_HREF } from "../config/agent";
import { useFocusTrap } from "../lib/useFocusTrap";
import { useSheetDrag } from "../lib/useSheetDrag";

/** The "More" sheet — mobile secondary navigation, flick down to dismiss. */
export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useSheetDrag(open, onClose);
  useFocusTrap(panelRef, open, onClose);
  const setPanel = useCallback(
    (el: HTMLElement | null) => {
      panelRef.current = el as HTMLDivElement | null;
      dragRef.current = el as HTMLDivElement | null;
    },
    [dragRef]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More menu">
      <MotionSurface
        variant="gallery"
        className="absolute inset-0 bg-ocean-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <MotionSurface
        variant="menu"
        ref={setPanel}
        className="glass-deep mobile-more-sheet absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-white/10 px-5 pt-2.5 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)", touchAction: "pan-y" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-mist-100/30" />
        <p className="eyebrow mb-3">Menu</p>
        <nav className="grid grid-cols-2 gap-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="glass rounded-2xl px-4 py-4 text-base font-medium text-mist-100 transition hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={SMS_HREF} onClick={onClose} className="btn-plum mt-3 block px-6 py-3.5 text-center text-base">
          Text Raegan · {AGENT.cell}
        </a>
        <a href={CELL_HREF} onClick={onClose} className="btn-ghost mt-2.5 block px-6 py-3.5 text-center text-base">
          Call Raegan
        </a>
      </MotionSurface>
    </div>
  );
}
