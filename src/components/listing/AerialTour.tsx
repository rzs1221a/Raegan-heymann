import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import LiveMap from "../LiveMap";
import type { LiveMapHandle } from "../LiveMap";
import type { Listing } from "../../data/listings";
import { shortPrice } from "../../data/listings";
import type { Community } from "../../data/communities";
import { buildTour } from "../../lib/listingTour";
import { useFocusTrap } from "../../lib/useFocusTrap";
import { SMS_HREF } from "../../config/agent";
import { prefersReducedMotion, useSurfaceMotion } from "../../lib/renderMotion";

/**
 * The Aerial Tour — a one-tap cinematic 3D flythrough that narrates a listing's
 * value from above. Drives LiveMapHandle.frame() through generated beats; the
 * per-beat progress bar's CSS animationend advances the tour, so pause/resume
 * stays perfectly in sync (no timers to drift). Esc / ✕ / backdrop close it.
 */
export default function AerialTour({
  listing,
  community,
  onClose,
}: {
  listing: Listing;
  community?: Community;
  onClose: () => void;
}) {
  const reduce = prefersReducedMotion();
  const beats = useMemo(() => buildTour(listing, community), [listing, community]);
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

  // The progress fill finished → advance, or end the tour on the last beat.
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

  // Portal to <body> so the overlay escapes Layout's transformed (stacking-
  // context-creating) page-transition wrapper and truly covers the chrome.
  return createPortal(
    <div
      ref={shellRef}
      className="fixed inset-0 z-[100] bg-ocean-950"
      role="dialog"
      aria-modal="true"
      aria-label={`Aerial tour of ${listing.title}`}
      tabIndex={-1}
    >
      <div className="relative h-svh w-full overflow-hidden">
        <LiveMap
          ref={mapRef}
          initialView={initialView}
          interactive={false}
          auto3D
          dim="none"
          posterImage={community?.heroImage ?? "coast-hero"}
          onReady={() => setReady(true)}
          className="absolute inset-0"
        />

        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ocean-950/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] bg-gradient-to-t from-ocean-950 via-ocean-950/55 to-transparent" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 md:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              ◆ Aerial Tour
            </p>
            <h2 className="mt-1.5 font-display text-xl text-mist-100 md:text-2xl">
              {listing.title}
            </h2>
            <p className="text-sm text-mist-300">
              {shortPrice(listing.price)} · {listing.community}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close aerial tour"
            className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-mist-100 hover:text-gold"
          >
            ✕
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
          {/* Progress segments */}
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
            {/* Caption */}
            <div className="max-w-xl">
                <div key={idx} className="tour-caption-frame">
                  <p className="eyebrow eyebrow-line mb-2.5">{beat.eyebrow}</p>
                  <p className="text-lg leading-relaxed text-mist-100 md:text-xl">
                    {beat.caption}
                  </p>
                </div>

              {/* Transport */}
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

            {/* Convert the moment */}
            <div className="flex shrink-0 flex-wrap gap-3">
              <a href={SMS_HREF} className="pill px-5 py-3 text-sm text-mist-100">
                Text Raegan
              </a>
              <Link
                to="/contact"
                onClick={onClose}
                className="btn-plum px-6 py-3 text-sm"
              >
                Request a showing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
