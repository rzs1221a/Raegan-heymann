import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GeoPin, MapImageId } from "../lib/geo";
import { mapImages, projectToImage } from "../lib/geo";
import CoastMap from "./CoastMap";

/**
 * Real satellite backdrop — stitched Esri World Imagery (the same imagery
 * source The Aerial uses), with geo-projected pins that stay accurate while
 * the image cover-crops to its container. Falls back to the illustrated
 * CoastMap if imagery is missing.
 */
export default function SatelliteMap({
  image = "coast-hero",
  pins = [],
  drift = false,
  dim = "none",
  showAttribution = false,
  className = "",
  children,
}: {
  image?: MapImageId;
  pins?: GeoPin[];
  drift?: boolean;
  /** Extra darkening for use behind text-heavy sections. */
  dim?: "none" | "soft" | "deep";
  showAttribution?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const img = mapImages[image];
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (failed) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div ref={ref} className="relative h-full w-full">
          <CoastMap drift={drift} className="absolute inset-0" />
          {children}
        </div>
      </div>
    );
  }

  // Emulate object-fit: cover / object-position: center so pin positions
  // can be computed in container space.
  const scale = box.w && box.h ? Math.max(box.w / img.width, box.h / img.height) : 0;
  const offsetX = (box.w - img.width * scale) / 2;
  const offsetY = (box.h - img.height * scale) / 2;

  const placed = scale
    ? pins
        .map((pin) => {
          const p = projectToImage(img, pin.lat, pin.lon);
          const x = p.x * scale + offsetX;
          const y = p.y * scale + offsetY;
          const visible =
            p.inside && x > 8 && x < box.w - 8 && y > 14 && y < box.h - 14;
          return { pin, x, y, visible };
        })
        .filter((p) => p.visible)
    : [];

  const dimClass =
    dim === "deep"
      ? "bg-ocean-950/70"
      : dim === "soft"
        ? "bg-ocean-950/45"
        : "bg-ocean-950/20";

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div ref={ref} className="relative h-full w-full">
        <div className={`absolute inset-0 ${drift ? "aerial-drift" : ""}`}>
        <img
          src={img.src}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        {/* Pins live inside the drifting layer so they track the imagery */}
        {placed.map(({ pin, x, y }) => (
          <div
            key={pin.label}
            className={`absolute -translate-y-1/2 items-center gap-1.5 ${
              pin.desktopOnly ? "hidden lg:flex" : "flex"
            } ${pin.side === "left" ? "-translate-x-full flex-row-reverse pr-1.5" : "-translate-x-1 pl-0"}`}
            style={{ left: x, top: y }}
          >
            <span
              className={`block shrink-0 rounded-full ${
                pin.major
                  ? "pin-pulse h-2.5 w-2.5 bg-plum-500"
                  : "h-1.5 w-1.5 bg-mist-100/80 shadow-[0_0_6px_rgba(0,0,0,0.8)]"
              }`}
            />
            <span
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] tracking-wide ${
                pin.major
                  ? "glass text-mist-100"
                  : "bg-ocean-950/55 text-mist-200 backdrop-blur-sm"
              }`}
            >
              {pin.label}
            </span>
          </div>
        ))}
      </div>

      {/* Atmosphere — keeps the Aerial's dark coastal grade over raw imagery */}
      <div className={`pointer-events-none absolute inset-0 ${dimClass}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_20%,transparent_40%,rgba(7,28,36,0.55)_100%)]" />

        {showAttribution && (
          <span className="absolute bottom-2 right-3 rounded-full bg-ocean-950/50 px-2.5 py-0.5 text-[9px] tracking-wide text-mist-400 backdrop-blur-sm">
            Imagery: Esri · Maxar · Earthstar Geographics
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
