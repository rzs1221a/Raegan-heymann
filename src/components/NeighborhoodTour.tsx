import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LiveMap from "./LiveMap";
import type { LiveMapHandle } from "./LiveMap";
import SearchCta from "./SearchCta";
import type { Neighborhood, NeighborhoodRegion } from "../data/neighborhoods.config";
import { buildNeighborhoodTour } from "../lib/neighborhoodTour";
import { useFocusTrap } from "../lib/useFocusTrap";
import { prefersReducedMotion, useSurfaceMotion } from "../lib/renderMotion";

/**
 * "Fly this neighborhood" — the full-screen cinematic flyover for a
 * neighborhood page, cloned from the listing AerialTour shell (same progress
 * segments, pause/resume, focus trap). The final beat lands on the listings
 * CTA: the tour is a toy, the exit is inventory.
 */
export default function NeighborhoodTour({
  neighborhood,
  region,
  onClose,
}: {
  neighborhood: Neighborhood;
  region?: NeighborhoodRegion;
  onClose: () => void;
}) {
  const reduce = prefersReducedMotion();
  const beats = useMemo(
    () => buildNeighborhoodTour(neighborhood, region),
    [neighborhood, region]
  );
  const mapRef = useRef<LiveMapHandle>(null);
  const shellRef = useSurfaceMotion<HTMLDivElement>([], "gallery");

  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(!reduce);

  const last = beats.length - 1;
  const beat = beats[idx];
  const ended = idx === last && !playing;

  useFocusTrap(shellRef, true, onClose);

  // Lock background scroll while the tour is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fly the camera to the active beat once the map is ready.
  useEffect(() => {
    if (!ready || !beat) return;
    mapRef.current?.frame(beat.lat, beat.lon, {
      zoom: beat.zoom,
      pitch: beat.pitch,
      bearing: beat.bearing,
      duration: Math.min(beat.duration - 600, 3200),
    });
  }, [ready, idx, beat]);

  function go(to: number) {
    setIdx(Math.max(0, Math.min(last, to)));
    setPlaying(true);
  }

  function onBeatComplete() {
    if (idx < last) setIdx(idx + 1);
    else setPlaying(false);
  }

  const initialView = {
    center: [beats[0].lon, beats[0].lat] as [number, number],
    zoom: beats[0].zoom,
    pitch: beats[0].pitch,
    bearing: beats[0].bearing,
  };

  return createPortal(
    <div
      ref={shellRef}
      className="fixed inset-0 z-[100] bg-ocean-950"
      role="dialog"
      aria-modal="true"
      aria-label={`Aerial flyover of ${neighborhood.name}`}
      tabIndex={-1}
    >
      <div className="relative h-svh w-full overflow-hidden">
        <LiveMap
          ref={mapRef}
          initialView={initialView}
          interactive={false}
          auto3D
          dim="none"
          posterImage="coast-hero"
          onReady={() => setReady(true)}
          className="absolute inset-0"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ocean-950/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] bg-gradient-to-t from-ocean-950 via-ocean-950/55 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 md:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              ◆ Neighborhood Flyover
            </p>
            <h2 className="mt-1.5 font-display text-xl text-mist-100 md:text-2xl">
              {neighborhood.name}
            </h2>
            {region && <p className="text-sm text-mist-300">{region.name}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close flyover"
            className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-mist-100 hover:text-gold"
          >
            ✕
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
          <div className="mb-4 flex gap-1.5">
            {beats.map((b, i) => (
              <button
                key={b.key}
                type="button"
                onClick={() => go(i)}
                aria-label={`Beat ${i + 1}: ${b.eyebrow}`}
                className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
              >
                {i < idx && <span className="absolute inset-0 bg-gold" />}
                {i === idx && (
                  <span
                    key={`${idx}-${playing}`}
                    className="tour-fill absolute inset-0 bg-gold"
                    style={{
                      animationDuration: `${beat.duration}ms`,
                      animationPlayState: playing ? "running" : "paused",
                    }}
                    onAnimationEnd={onBeatComplete}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <div key={idx} className="tour-caption-frame">
                <p className="eyebrow eyebrow-line mb-2.5">{beat.eyebrow}</p>
                <p className="text-lg leading-relaxed text-mist-100 md:text-xl">
                  {beat.caption}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(idx - 1)}
                  disabled={idx === 0}
                  aria-label="Previous beat"
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-mist-100 disabled:opacity-30 hover:text-gold"
                >
                  ‹
                </button>
                {ended ? (
                  <button
                    type="button"
                    onClick={() => go(0)}
                    className="btn-ghost px-5 py-2.5 text-xs"
                  >
                    ↺ Replay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? "Pause" : "Play"}
                    className="glass flex h-10 w-10 items-center justify-center rounded-full text-mist-100 hover:text-gold"
                  >
                    {playing ? "❚❚" : "▸"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go(idx + 1)}
                  disabled={idx === last}
                  aria-label="Next beat"
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-mist-100 disabled:opacity-30 hover:text-gold"
                >
                  ›
                </button>
                <span className="ml-1 text-xs tabular-nums text-mist-400">
                  {idx + 1} / {beats.length}
                </span>
              </div>
            </div>

            {/* The exit is always inventory. */}
            <div className="flex shrink-0 flex-wrap gap-3">
              <SearchCta neighborhood={neighborhood} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
