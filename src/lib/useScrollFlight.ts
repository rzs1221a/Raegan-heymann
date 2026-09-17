import { useCallback, useEffect, useRef } from "react";
import type { TourBeat } from "./listingTour";
import { backgroundMapRef } from "./backgroundMap";
import { useExperienceConfig } from "./experienceContext";
import { prefersReducedMotion } from "./renderMotion";

/**
 * Scroll-driven flight: attach beat-keyed refs to page sections and the
 * persistent background map flies to each beat as its section crosses the
 * viewport's focus band — scrolling the page becomes the flyover.
 *
 * Quietly does nothing when the experience profile runs without the live map
 * or the visitor prefers reduced motion, so the page still reads perfectly
 * as static content.
 */
export function useScrollFlight(
  beats: Record<string, TourBeat | undefined>,
  padding?: { top: number; right: number; bottom: number; left: number }
) {
  const experience = useExperienceConfig();
  const enabled =
    (experience.persistentMap || experience.liveMapRoutes) &&
    !prefersReducedMotion();
  const sections = useRef(new Map<string, Element>());
  const observer = useRef<IntersectionObserver | null>(null);
  const activeKey = useRef<string | null>(null);
  const beatsRef = useRef(beats);
  const padRef = useRef(padding);
  useEffect(() => {
    beatsRef.current = beats;
    padRef.current = padding;
  }, [beats, padding]);

  useEffect(() => {
    if (!enabled) return;
    // A narrow horizontal band around the upper-middle of the viewport: the
    // section crossing it is "the one you're reading", and the camera follows.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset.flightBeat;
          if (!key || key === activeKey.current) continue;
          const beat = beatsRef.current[key];
          if (!beat) continue;
          activeKey.current = key;
          backgroundMapRef.current?.frame(beat.lat, beat.lon, {
            zoom: beat.zoom,
            pitch: beat.pitch,
            bearing: beat.bearing,
            duration: 2400,
            padding: padRef.current,
          });
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 }
    );
    observer.current = io;
    sections.current.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      observer.current = null;
      activeKey.current = null;
    };
  }, [enabled]);

  /** Ref factory: <section ref={flight("signature")} …> */
  return useCallback(
    (key: string) => (el: Element | null) => {
      const prev = sections.current.get(key);
      if (prev && observer.current) observer.current.unobserve(prev);
      if (el) {
        (el as HTMLElement).dataset.flightBeat = key;
        sections.current.set(key, el);
        observer.current?.observe(el);
      } else {
        sections.current.delete(key);
      }
    },
    []
  );
}
