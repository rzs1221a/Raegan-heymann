import { useEffect } from "react";
import type { MapMarker } from "../components/LiveMap";
import { backgroundMapRef, setBackgroundMarkers } from "./backgroundMap";
import { useExperienceConfig } from "./experienceContext";

export type BackgroundFrame = {
  lat: number;
  lon: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
};

function framePad() {
  if (typeof window === "undefined")
    return { top: 112, right: 96, bottom: 160, left: 96 };
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  return desktop
    ? {
        top: Math.round(window.innerHeight * 0.16),
        right: Math.round(window.innerWidth * 0.08),
        bottom: Math.round(window.innerHeight * 0.2),
        left: Math.round(window.innerWidth * 0.42),
      }
    : { top: 96, right: 24, bottom: Math.round(window.innerHeight * 0.45), left: 24 };
}

/**
 * Fly the persistent background map to a frame and light it up with markers
 * for the lifetime of the page — the same choreography CommunityDetail uses,
 * factored out for the /neighborhoods pages. No-ops (and clears markers) on
 * experience profiles that run without the live map.
 */
export function useBackgroundFrame(
  frame: BackgroundFrame | null,
  markers: MapMarker[],
  activeId?: string | null
) {
  const experience = useExperienceConfig();
  const liveMapEnabled = experience.persistentMap || experience.liveMapRoutes;

  useEffect(() => {
    if (!frame) return;
    if (!liveMapEnabled) {
      setBackgroundMarkers([]);
      return;
    }
    setBackgroundMarkers(markers);
    const raf = requestAnimationFrame(() => setBackgroundMarkers(markers));
    const timer = window.setTimeout(() => setBackgroundMarkers(markers), 900);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [frame, liveMapEnabled, markers]);

  useEffect(() => {
    if (!frame || !liveMapEnabled) return;
    let raf = 0;
    let cancelled = false;
    const fly = () => {
      if (cancelled) return;
      const map = backgroundMapRef.current;
      if (!map) {
        raf = requestAnimationFrame(fly);
        return;
      }
      if (activeId !== undefined) map.setActive(activeId);
      map.frame(frame.lat, frame.lon, {
        zoom: frame.zoom,
        pitch: frame.pitch ?? 58,
        bearing: frame.bearing ?? -14,
        duration: 1850,
        padding: frame.padding ?? framePad(),
      });
    };
    fly();
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refly only when the frame target moves
  }, [frame?.lat, frame?.lon, frame?.zoom, liveMapEnabled, activeId]);

  useEffect(() => {
    return () => {
      setBackgroundMarkers([]);
      backgroundMapRef.current?.setActive(null);
    };
  }, []);
}
