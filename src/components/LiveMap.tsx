import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Map as MLMap, Marker as MLMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { coastStyle } from "../lib/mapStyle";
import {
  APPROACH_VIEW,
  HOME_VIEW,
  HOME_ZOOM_RANGE,
  MAX_BOUNDS,
  PHOTOREAL_OFF,
  PHOTOREAL_ON,
  type MapView,
  type MapImageId,
} from "../lib/geo";
import { attachPhotoreal, detachPhotoreal } from "../lib/photoreal";
import { getExperienceConfig, scaledExperienceDuration } from "../lib/experienceProfile";
import { setRenderMotionIntent } from "../lib/renderMotion";
import SatelliteMap from "./SatelliteMap";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  kind?: "beacon" | "pin" | "area";
  label?: string;
  /** Shown inside a pin chip (e.g. a price). */
  chip?: string;
  major?: boolean;
  active?: boolean;
  onClick?: (id: string) => void;
  onDblClick?: (id: string) => void;
  onHover?: (id: string) => void;
  onHoverEnd?: (id: string) => void;
}

type Pad = { top?: number; right?: number; bottom?: number; left?: number };
type MapLibreApi = Pick<typeof import("maplibre-gl"), "Marker">;
type MarkerEntry = { marker: MLMarker; el: HTMLElement; sig: string };
type InteractionHandler = { enable: () => void; disable: () => void };
type InteractiveMap = MLMap & {
  boxZoom: InteractionHandler;
  scrollZoom: InteractionHandler;
  dragPan: InteractionHandler;
  dragRotate: InteractionHandler;
  keyboard: InteractionHandler;
  doubleClickZoom: InteractionHandler;
  touchZoomRotate: InteractionHandler;
};

export interface LiveMapHandle {
  flyTo: (
    view: Partial<MapView>,
    opts?: { duration?: number; padding?: Pad }
  ) => void;
  frame: (
    lat: number,
    lon: number,
    opts?: Partial<MapView> & { duration?: number; padding?: Pad }
  ) => void;
  setActive: (id: string | null) => void;
  getMap: () => MLMap | null;
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Render-resolution cap. Phones are often 3x DPR and even desktops are 2x;
 * rendering the GL plate at full DPR is the main fill-rate cost (especially the
 * continuous desktop orbit, which repaints every frame). The interactive Homes
 * map (dim "clear") stays crisp so detail is sharp; the dimmed, orbiting
 * background renders lighter — invisible behind the cinematic grade + glass, but
 * far cheaper to repaint, which is what makes the orbit buttery.
 */
function pixelRatioFor(dim: string): number {
  if (typeof window === "undefined") return 1;
  const config = getExperienceConfig();
  const dpr = window.devicePixelRatio || 1;
  const crisp = Math.min(dpr, config.mapDprClear);
  const light = Math.min(dpr, config.mapDprDimmed);
  return dim === "clear" ? crisp : light;
}

function markerSignature(data: MapMarker): string {
  return [
    data.kind ?? "beacon",
    data.label ?? "",
    data.chip ?? "",
    data.major ? "1" : "0",
  ].join("|");
}

function setMapInteraction(map: MLMap, enabled: boolean) {
  const m = map as InteractiveMap;
  const action = enabled ? "enable" : "disable";
  m.boxZoom[action]();
  m.scrollZoom[action]();
  m.dragPan[action]();
  m.dragRotate[action]();
  m.keyboard[action]();
  m.doubleClickZoom[action]();
  m.touchZoomRotate[action]();
}

function markerMarkup(data: MapMarker): string {
  if (data.kind === "pin") return `<span class="lm-pin">${data.chip ?? ""}</span>`;
  if (data.kind === "area") return `<span class="lm-area">${data.label ?? ""}</span>`;
  return `<span class="lm-dot${data.major ? " lm-dot-major" : ""}"></span>${
    data.label ? `<span class="lm-label">${data.label}</span>` : ""
  }`;
}

function updateMarkerElement(el: HTMLElement, data: MapMarker, sig: string) {
  el.dataset.kind = data.kind ?? "beacon";
  if (typeof data.active === "boolean") {
    el.dataset.active = String(data.active);
  }
  el.setAttribute("aria-label", data.label ?? "Map location");
  if (el.dataset.markerSig === sig) return;
  el.innerHTML = markerMarkup(data);
  el.dataset.markerSig = sig;
}

/**
 * The living coast — an interactive MapLibre plate (Esri imagery + OSM 3D
 * buildings, the same engine The Aerial runs), with a static satellite poster
 * underneath that cross-fades out on load. Degrades to the poster if WebGL or
 * tiles are unavailable, and honors reduced-motion. Google Photorealistic 3D
 * Tiles auto-attach past close zoom when `auto3D` and a key are set.
 */
const LiveMap = forwardRef<LiveMapHandle, {
  initialView?: MapView;
  interactive?: boolean;
  intro?: boolean;
  markers?: MapMarker[];
  posterImage?: MapImageId;
  /** Static poster underlay that cross-fades to the live map. Disable it when
   *  the map flies on load (intro/route changes) — a poster framed differently
   *  from the moving camera ghosts as a "second image" during the fly. */
  poster?: boolean;
  dim?: "clear" | "none" | "soft" | "deep";
  auto3D?: boolean;
  orbit?: boolean | { speed?: number };
  /** GPU antialiasing. Cheap to turn off for a dimmed, behind-glass backdrop. */
  antialias?: boolean;
  showAttribution?: boolean;
  className?: string;
  onReady?: () => void;
  children?: ReactNode;
}>(function LiveMap(
  {
    initialView = HOME_VIEW,
    interactive = false,
    intro = false,
    markers = [],
    posterImage = "coast-hero",
    poster = true,
    dim = "soft",
    auto3D = false,
    orbit = false,
    antialias = true,
    showAttribution = true,
    className = "",
    onReady,
    children,
  },
  ref
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const maplibreRef = useRef<MapLibreApi | null>(null);
  const markerRef = useRef<Map<string, MarkerEntry>>(new Map());
  const activeRef = useRef<string | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const resizeRafRef = useRef(0);
  const orbitPauseUntilRef = useRef(0);
  const cameraSeqRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Keep latest props without re-initializing the map.
  const markerById = useMemo(
    () => new Map(markers.map((marker) => [marker.id, marker])),
    [markers]
  );
  const latest = useRef({ markers, markerById, initialView, intro, auto3D });
  latest.current = { markers, markerById, initialView, intro, auto3D };

  useImperativeHandle(ref, () => ({
    flyTo(view, opts) {
      const map = mapRef.current;
      if (!map) return;
      const duration = scaledExperienceDuration(opts?.duration ?? 2600);
      const seq = ++cameraSeqRef.current;
      map.stop();
      setRenderMotionIntent("map", duration + 260);
      orbitPauseUntilRef.current = Date.now() + duration + 1800;
      const pad = opts?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
      if (reducedMotion()) {
        map.jumpTo({ ...(view as object), padding: pad } as never);
        return;
      }
      window.requestAnimationFrame(() => {
        if (seq !== cameraSeqRef.current || !mapRef.current) return;
        map.flyTo({
          ...(view as object),
          padding: pad,
          duration,
          curve: 1.42,
          essential: true,
        } as never);
      });
    },
    frame(lat, lon, opts) {
      const map = mapRef.current;
      if (!map) return;
      const duration = scaledExperienceDuration(opts?.duration ?? 3000);
      const seq = ++cameraSeqRef.current;
      map.stop();
      setRenderMotionIntent("map", duration + 260);
      orbitPauseUntilRef.current = Date.now() + duration + 1800;
      const target = {
        center: [lon, lat] as [number, number],
        zoom: opts?.zoom ?? 13,
        pitch: opts?.pitch ?? 50,
        bearing: opts?.bearing ?? 0,
      };
      const pad = opts?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
      if (reducedMotion()) {
        map.jumpTo({ ...target, padding: pad } as never);
        return;
      }
      window.requestAnimationFrame(() => {
        if (seq !== cameraSeqRef.current || !mapRef.current) return;
        map.flyTo({ ...target, padding: pad, duration, curve: 1.38, essential: true } as never);
      });
    },
    setActive(id) {
      if (activeRef.current === id) return;
      const prev = activeRef.current;
      activeRef.current = id;
      if (prev) {
        const prevEntry = markerRef.current.get(prev);
        if (prevEntry) prevEntry.el.dataset.active = "false";
      }
      if (id) {
        const nextEntry = markerRef.current.get(id);
        if (nextEntry) nextEntry.el.dataset.active = "true";
      }
    },
    getMap: () => mapRef.current,
  }));

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    let map: MLMap | null = null;
    const markers = markerRef.current;

    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !hostRef.current) return;
        maplibreRef.current = maplibregl;

        map = new maplibregl.Map({
          container: hostRef.current,
          style: coastStyle,
          center: (latest.current.intro ? APPROACH_VIEW : initialView).center,
          zoom: (latest.current.intro ? APPROACH_VIEW : initialView).zoom,
          pitch: (latest.current.intro ? APPROACH_VIEW : initialView).pitch,
          bearing: initialView.bearing,
          minZoom: HOME_ZOOM_RANGE.minZoom,
          maxZoom: HOME_ZOOM_RANGE.maxZoom,
          maxPitch: 75,
          maxBounds: MAX_BOUNDS,
          interactive,
          attributionControl: false,
          dragRotate: interactive,
          pitchWithRotate: interactive,
          antialias,
          pixelRatio: pixelRatioFor(dim),
          renderWorldCopies: false,
          fadeDuration: 120,
        });
        mapRef.current = map;
        syncMarkers();

        // Keep the GL canvas matched to the container (it defaults to 400x300
        // if the container measured 0 at construction).
        const scheduleResize = () => {
          if (resizeRafRef.current) return;
          resizeRafRef.current = window.requestAnimationFrame(() => {
            resizeRafRef.current = 0;
            map?.resize();
          });
        };
        const ro = new ResizeObserver(scheduleResize);
        if (hostRef.current) ro.observe(hostRef.current);
        roRef.current = ro;

        // Area (neighborhood) labels only appear once you've zoomed in past the
        // wide overview, so the fit-all view stays clean and labels don't pile up.
        const AREA_ZOOM = 10.6;
        let areaLabelRaf = 0;
        let areaLabelsFar: boolean | null = null;
        const updateAreaLabels = () => {
          if (cancelled || !map || !hostRef.current) return;
          const next = map.getZoom() < AREA_ZOOM;
          if (areaLabelsFar === next) return;
          areaLabelsFar = next;
          hostRef.current.classList.toggle("lm-far", next);
        };
        const scheduleAreaLabels = () => {
          if (areaLabelRaf) return;
          areaLabelRaf = window.requestAnimationFrame(() => {
            areaLabelRaf = 0;
            updateAreaLabels();
          });
        };

        let photorealRaf = 0;
        let photorealWanted = false;
        const updatePhotoreal = () => {
          if (cancelled || !map) return;
          const z = map.getZoom();
          const next =
            z >= PHOTOREAL_ON ? true : z <= PHOTOREAL_OFF ? false : photorealWanted;
          if (next === photorealWanted) return;
          photorealWanted = next;
          if (next) void attachPhotoreal(map);
          else detachPhotoreal();
        };
        const schedulePhotoreal = () => {
          if (photorealRaf) return;
          photorealRaf = window.requestAnimationFrame(() => {
            photorealRaf = 0;
            updatePhotoreal();
          });
        };

        map.on("load", () => {
          if (cancelled) return;
          map!.resize();
          setLoaded(true);
          onReady?.();
          syncMarkers();
          updateAreaLabels();
          map!.on("zoom", scheduleAreaLabels);
          if (latest.current.intro && !reducedMotion()) {
            map!.flyTo({
              ...initialView,
              duration: 4200,
              curve: 1.42,
              essential: true,
            } as never);
          }
        });

        map.on("error", (e) => {
          // Missing vector tiles shouldn't kill the imagery plate; only a hard
          // context failure falls back to the poster.
          const msg = String(e?.error?.message ?? "");
          if (msg.includes("WebGL") || msg.includes("context")) setFailed(true);
        });

        if (latest.current.auto3D) {
          updatePhotoreal();
          map.on("zoom", schedulePhotoreal);
        }
      } catch (err) {
        console.warn("LiveMap: MapLibre unavailable, using poster.", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (resizeRafRef.current) window.cancelAnimationFrame(resizeRafRef.current);
      roRef.current?.disconnect();
      detachPhotoreal();
      markers.forEach((m) => m.marker.remove());
      markers.clear();
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setMapInteraction(map, interactive);
  }, [interactive, loaded]);

  // Cinematic idle orbit — a slow, continuous bearing sweep, like drifting around
  // town. It runs steadily and does NOT pause on scroll (the user wants the drift
  // uninterrupted). It still pauses when the tab is hidden and during scripted
  // camera flights, and honors reduced-motion.
  useEffect(() => {
    if (!orbit || !loaded || failed || reducedMotion()) return;
    const speed =
      typeof orbit === "object" && typeof orbit.speed === "number"
        ? orbit.speed
        : 2.2;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const map = mapRef.current;
      const dt = Math.min(now - last, 80) / 1000;
      last = now;
      if (
        map &&
        !document.hidden &&
        Date.now() > orbitPauseUntilRef.current &&
        !map.isMoving()
      ) {
        map.setBearing(map.getBearing() + speed * dt);
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [orbit, loaded, failed]);

  // Re-cap resolution when the grade flips (entering/leaving the interactive
  // Homes map): crisp where it's the foreground, light where it's the dimmed,
  // orbiting backdrop. The one resize this triggers is masked by the route fly.
  useEffect(() => {
    if (loaded) mapRef.current?.setPixelRatio(pixelRatioFor(dim));
  }, [dim, loaded]);

  // Build / update markers.
  function syncMarkers() {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!map || !maplibregl) return;
    const next = new Set(latest.current.markers.map((m) => m.id));

    // Remove stale.
    markerRef.current.forEach((m, id) => {
      if (!next.has(id)) {
        m.marker.remove();
        markerRef.current.delete(id);
      }
    });

    for (const data of latest.current.markers) {
      const existing = markerRef.current.get(data.id);
      if (existing) {
        const sig = markerSignature(data);
        existing.marker.setLngLat([data.lon, data.lat]);
        updateMarkerElement(existing.el, data, sig);
        existing.sig = sig;
        continue;
      }
      const el = document.createElement("button");
      el.type = "button";
      el.className = "lm-marker";
      el.dataset.active = String(data.active ?? activeRef.current === data.id);
      const sig = markerSignature(data);
      updateMarkerElement(el, data, sig);
      // Look the handler up at event time so cached markers always call the
      // latest callback (avoids stale closures when results change).
      const live = () => latest.current.markerById.get(data.id);
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        live()?.onClick?.(data.id);
      });
      el.addEventListener("dblclick", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        live()?.onDblClick?.(data.id);
      });
      el.addEventListener("mouseenter", () => live()?.onHover?.(data.id));
      el.addEventListener("mouseleave", () => live()?.onHoverEnd?.(data.id));
      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
        // Float area labels above the pin cluster so they don't collide with prices.
        offset: data.kind === "area" ? [0, -26] : [0, 0],
        })
        .setLngLat([data.lon, data.lat])
        .addTo(map);
      markerRef.current.set(data.id, { marker, el, sig });
    }
  }

  useEffect(() => {
    syncMarkers();
  }, [markers, loaded]);

  // Drive the grade overlays by opacity (not class swaps) so the tint can FADE
  // between states — e.g. it dissolves away entering Homes (dim="clear") and
  // eases back on leave, instead of snapping.
  const dimOpacity =
    dim === "deep" ? 0.7 : dim === "soft" ? 0.4 : dim === "none" ? 0.15 : 0;

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="relative h-full w-full">
        {/* Clean dark base — fills the frame before tiles paint (no poster ghost
            when poster is disabled). */}
        <div className="absolute inset-0 bg-ocean-950" />

        {/* Static poster — instant paint + permanent fallback. Skipped (poster
             false) when the camera flies on load, so it can't ghost the move. */}
        {(poster || failed) && (
          <div
            className={`absolute inset-0 transition-opacity duration-[1200ms] ${
              loaded && !failed ? "opacity-0" : "opacity-100"
            }`}
          >
            <SatelliteMap
              image={posterImage}
              drift={!loaded}
              dim={dim === "clear" ? "none" : dim}
              showAttribution={false}
              className="absolute inset-0"
            />
          </div>
        )}

        {/* Live MapLibre canvas */}
        {!failed && (
          <div
            ref={hostRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-[1200ms] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Grade overlays — the cabernet/gold cinematic look over raw tiles.
            Opacity-driven + transitioned so dim="clear" dissolves to a true,
            untinted satellite and eases back. */}
        <div
          className="pointer-events-none absolute inset-0 bg-ocean-950 transition-opacity duration-[900ms] ease-out"
          style={{ opacity: dimOpacity }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_60%_18%,transparent_42%,rgba(5,5,7,0.6)_100%)] transition-opacity duration-[900ms] ease-out"
          style={{ opacity: dim === "clear" ? 0 : 1 }}
        />

        {showAttribution && (
          <span className="pointer-events-none absolute bottom-2 right-3 z-10 rounded-full bg-ocean-950/55 px-2.5 py-0.5 text-[9px] tracking-wide text-mist-400 backdrop-blur-sm">
            {auto3D ? "Esri · OpenFreeMap · Google" : "Esri · Maxar · OpenFreeMap"}
          </span>
        )}

        {children}
      </div>
    </div>
  );
});

export default LiveMap;
