/**
 * GSAP + ScrollTrigger, registered once. GSAP owns the scroll-linked and
 * choreographed motion (split-text intros, pinned reel, scroll progress,
 * parallax); coastal's CSS/WAAPI owns state transitions (route bloom, glass,
 * magnetic hover, reveals). Both answer to the same signals: reduced motion
 * and the experience profile.
 */
import { useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getExperienceConfig } from "../experienceProfile";
import { prefersReducedMotion } from "../renderMotion";

let registered = false;
export function ensureGsap() {
  if (registered) return gsap;
  registered = true;
  gsap.registerPlugin(ScrollTrigger);
  // iOS Safari's URL bar resize used to re-measure every pin; ignore it.
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(500, 33);
  gsap.defaults({ ease: "power3.out" });
  return gsap;
}

/** Heavier effects (pins, scrubs) run on desktop-cinematic only. */
export function motionEnabled(level: "all" | "heavy" = "all"): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  if (level === "heavy") return getExperienceConfig().profile === "desktop-cinematic";
  return true;
}

/**
 * Run a GSAP setup inside gsap.context so everything it creates (tweens,
 * ScrollTriggers, split spans) is reverted on unmount — mandatory under
 * React StrictMode's double-mount.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (g: typeof gsap, st: typeof ScrollTrigger) => void,
  deps: DependencyList = []
) {
  useLayoutEffect(() => {
    if (!motionEnabled()) return;
    const g = ensureGsap();
    const ctx = g.context(() => setup(g, ScrollTrigger), scope.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function refreshScrollTriggers() {
  if (!registered) return;
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
