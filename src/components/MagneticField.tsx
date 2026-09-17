import { useEffect } from "react";

/**
 * Global "magnetic" hover — the same lean-toward-the-cursor micro-interaction as
 * the hero CTA, applied to every selectable button and pill across the site via
 * one delegated pointer listener (no per-element wrappers). The element under
 * the cursor translates a few px toward it and springs back on leave.
 *
 * Scoped to compact controls (buttons / pills), not large glass panels: a
 * transform on a backdrop-filter surface would break its liquid-glass blur.
 */
const SELECTOR = [
  ".btn-plum",
  ".btn-ghost",
  ".pill",
  "[data-magnetic]",
].join(",");

const STRENGTH = 0.28;
const MAX = 10; // px cap so large targets don't slide too far

export default function MagneticField() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current: HTMLElement | null = null;

    const release = (el: HTMLElement) => {
      el.style.transition = "transform 0.35s cubic-bezier(0.22,1,0.36,1)";
      el.style.transform = "";
    };

    // Throttle to one update per animation frame and cache the target's rect so
    // we never read layout more than once per frame (avoids mousemove jank).
    let lastX = 0;
    let lastY = 0;
    let rect: DOMRect | null = null;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const target = current;
      if (!target || !rect) return;
      const dx = (lastX - (rect.left + rect.width / 2)) * STRENGTH;
      const dy = (lastY - (rect.top + rect.height / 2)) * STRENGTH;
      const cx = Math.max(-MAX, Math.min(MAX, dx));
      const cy = Math.max(-MAX, Math.min(MAX, dy));
      target.style.transition = "transform 0.12s linear";
      target.style.transform = `translate(${cx}px, ${cy}px)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      lastX = e.clientX;
      lastY = e.clientY;
      const target = (e.target as Element | null)?.closest(
        SELECTOR
      ) as HTMLElement | null;

      if (target !== current) {
        if (current) release(current);
        current = target;
        // One layout read only when the hovered element changes.
        rect = target ? target.getBoundingClientRect() : null;
      }
      if (!target) return;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeaveWindow = () => {
      if (current) {
        release(current);
        current = null;
        rect = null;
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeaveWindow);

    return () => {
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeaveWindow);
      if (raf) cancelAnimationFrame(raf);
      if (current) release(current);
    };
  }, []);

  return null;
}
