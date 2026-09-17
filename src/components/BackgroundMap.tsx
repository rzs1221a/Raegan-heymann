import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  backgroundMapRef,
  viewForRoute,
  getBackgroundMarkers,
  getEmptyMarkers,
  subscribeBackgroundMarkers,
} from "../lib/backgroundMap";
import { HERO_APPROACH, HERO_VIEW, HOME_VIEW } from "../lib/geo";
import { useExperienceConfig } from "../lib/experienceContext";
import SatelliteMap from "./SatelliteMap";

const LiveMap = lazy(() => import("./LiveMap"));

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

function mapViewportKey() {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const height = window.innerHeight;
  const widthKey =
    width < 1024
      ? "compact"
      : width < 1500
        ? "desktop"
        : width < 1900
          ? "wide"
          : "cinema";
  const heightKey = height < 760 ? "short" : "standard";
  return `${widthKey}-${heightKey}`;
}

/**
 * The site-wide living coast. One MapLibre instance, mounted once behind every
 * page (fixed, non-interactive, lowest layer). On each route change the camera
 * flies to that page's frame, so navigation reads as one continuous flight — the
 * map never leaves, it just moves. A slow idle orbit keeps it alive between
 * moves. The translucent tint in Atmosphere sits on top, and the glass
 * panels frost whatever the camera is looking at — no black curtain.
 */
export default function BackgroundMap() {
  const { pathname } = useLocation();
  const [mapReady, setMapReady] = useState(false);
  const [viewportKey, setViewportKey] = useState(mapViewportKey);
  const listings = pathname === "/listings";
  const home = pathname === "/";
  const experience = useExperienceConfig();
  // The Homes page promotes the shared map to an interactive foreground.
  const mapApp = listings;
  const liveMapAllowed = experience.persistentMap || (experience.liveMapRoutes && mapApp);
  const interactive = listings;
  // The hero flight: built out over the Atlantic, and on `rh:boot-done` the
  // camera swoops onto the island. Only on a cold load of the home page.
  const heroFlight = useRef(home);
  // Captured once at mount, so render never reads the ref.
  const [initialView] = useState(() => (home ? HERO_APPROACH : HOME_VIEW));

  // Listing pins pushed by the Homes page; empty on every other route.
  const markers = useSyncExternalStore(
    subscribeBackgroundMarkers,
    getBackgroundMarkers,
    getEmptyMarkers
  );

  // Slow idle spin keeps the coast alive in cinematic desktop mode. It pauses
  // during scripted camera flights, but otherwise lets every map-backed route
  // breathe. Listings stays still because it is the direct interaction surface.
  const desktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 821px)").matches;
  const perf = experience;

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setViewportKey((current) => {
          const next = mapViewportKey();
          return current === next ? current : next;
        });
      }, 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!liveMapAllowed) return;
    if (mapReady) return;
    const delay = mapApp ? 0 : 220;
    let timeout = 0;
    let idle = 0;
    timeout = window.setTimeout(() => {
      const start = () => setMapReady(true);
      const idleWindow = window as IdleWindow;
      if (idleWindow.requestIdleCallback) {
        idle = idleWindow.requestIdleCallback(start, { timeout: 700 });
      } else {
        globalThis.setTimeout(start, 0);
      }
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      const idleWindow = window as IdleWindow;
      if (idle && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idle);
    };
  }, [mapReady, mapApp, pathname, liveMapAllowed, viewportKey]);

  useEffect(() => {
    if (!liveMapAllowed) return;
    if (!mapReady) return;
    // App-like map pages frame their own camera / interaction layer, so don't
    // fight them here.
    if (mapApp) return;
    // The first frame of a cold home load is the hero swoop, launched by the
    // boot gate below — not the route fly.
    if (heroFlight.current) return;
    // Let the route's content begin painting, then move the camera.
    const id = window.setTimeout(() => {
      backgroundMapRef.current?.flyTo(viewForRoute(pathname), { duration: 3200 });
    }, 90);
    return () => window.clearTimeout(id);
  }, [mapReady, mapApp, pathname, liveMapAllowed]);

  // Hero swoop: APPROACH → island as the boot gate dissolves. If the gate
  // already finished before the map was ready, fly as soon as it is.
  useEffect(() => {
    if (!heroFlight.current) return;
    let fired = false;
    let poll = 0;
    const fly = () => {
      if (fired) return;
      const map = backgroundMapRef.current;
      if (!map) {
        poll = window.setTimeout(fly, 120);
        return;
      }
      fired = true;
      heroFlight.current = false;
      map.flyTo(HERO_VIEW, { duration: 5200 });
    };
    const onBoot = () => fly();
    window.addEventListener("rh:boot-done", onBoot);
    // Safety: if the boot event never comes (gate disabled), fly anyway.
    const fallback = window.setTimeout(fly, 6000);
    return () => {
      window.removeEventListener("rh:boot-done", onBoot);
      window.clearTimeout(poll);
      window.clearTimeout(fallback);
    };
  }, []);

  // Leaving the home page before the swoop fired: just use route flights.
  useEffect(() => {
    if (!home) heroFlight.current = false;
  }, [home]);

  // On the Homes search page the SAME shared map becomes the right-hand search
  // map: interactive and untinted, lifted above the page background so its pins
  // can be hovered/clicked (the left content sits above it at a higher z). It's
  // the one instance, so the tab-to-tab flight is preserved. Everywhere else it
  // is the non-interactive, tinted backdrop at the lowest layer.
  return (
    <div
      className={`fixed inset-0 ${
        mapApp ? "z-0 pointer-events-auto" : "z-[-4] pointer-events-none"
      }`}
      aria-hidden={!mapApp}
    >
      {!liveMapAllowed && (
        <SatelliteMap
          image="coast-hero"
          dim={mapApp ? "soft" : "deep"}
          className="h-full w-full"
        />
      )}
      {liveMapAllowed && mapReady && (
        <Suspense fallback={null}>
          <LiveMap
            ref={backgroundMapRef}
            initialView={initialView}
            interactive={interactive}
            intro={false}
            poster
            markers={markers}
            orbit={perf.orbit && desktop && !listings ? { speed: 1 } : false}
            antialias={false}
            dim={mapApp ? "clear" : "soft"}
            showAttribution={false}
            className="h-full w-full"
          />
        </Suspense>
      )}
    </div>
  );
}
