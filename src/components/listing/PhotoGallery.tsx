import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import AerialPhoto from "../AerialPhoto";
import MotionSurface from "../MotionSurface";
import type { Listing } from "../../data/listings";
import { communityPhoto } from "../../data/communities";
import { useFocusTrap } from "../../lib/useFocusTrap";

interface Frame {
  src: string;
  label: string;
}

const statusTone: Record<Listing["status"], string> = {
  Active: "bg-gold text-charcoal",
  "Under Contract": "bg-white/15 text-mist-200",
  "Coming Soon": "bg-sand-300/25 text-sand-200",
};

/**
 * Listing photo gallery. We don't have interior photography for the sample
 * inventory, so the gallery is built from the real aerial imagery we DO have
 * (the community's stitched aerial + coast frames), each badged "Sample". The
 * Aerial Tour — the flagship — launches right from the hero, where the eye
 * already is. Swap `frames` for real MLS media in production.
 */
export default function PhotoGallery({
  listing,
  communitySlug,
  onOpenTour,
}: {
  listing: Listing;
  communitySlug?: string;
  onOpenTour: () => void;
}) {
  // Real MLS photos (Repliers adapter) when present; otherwise the aerial set
  // we have for the curated sample inventory.
  const hasRealPhotos = (listing.photos?.length ?? 0) > 0;
  const frames: Frame[] = hasRealPhotos
    ? listing.photos!.map((src, i) => ({ src, label: `Photo ${i + 1}` }))
    : [
        {
          src: communityPhoto(communitySlug ?? listing.community),
          label: `Aerial · ${listing.community}`,
        },
        { src: "/imagery/crane-detail.jpg", label: "Close aerial" },
        { src: "/imagery/coast-hero.jpg", label: "The coast" },
        { src: "/imagery/coast-full.jpg", label: "Region" },
      ];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(lightboxRef, lightbox, () => setLightbox(false));

  const go = (n: number) => setActive((active + n + frames.length) % frames.length);
  const frame = frames[active];

  return (
    <>
      <div className="overflow-hidden rounded-[1.75rem]">
        {/* Hero frame */}
        <div className="relative h-[44vh] min-h-[320px] w-full md:h-[56vh]">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Expand photo"
            className="absolute inset-0 h-full w-full"
          >
            <AerialPhoto
              src={frame.src}
              alt={`${frame.label} — ${listing.title}`}
              fallbackVariant={listing.image}
              className="h-full w-full"
            />
          </button>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-950/70 via-transparent to-transparent" />

          {/* Status + sample badges */}
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ${statusTone[listing.status]}`}
          >
            {listing.status}
          </span>
          {!hasRealPhotos && (
            <span className="absolute right-4 top-4 rounded-full bg-ocean-950/60 px-2.5 py-1 text-[10px] text-mist-300 backdrop-blur-sm">
              Sample · not a live listing
            </span>
          )}

          {/* Arrows */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="glass absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-mist-100 hover:text-gold"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="glass absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-mist-100 hover:text-gold"
          >
            ›
          </button>

          {/* Aerial Tour — the flagship, launched from the hero */}
          <button
            type="button"
            onClick={onOpenTour}
            className="btn-plum absolute bottom-4 right-4 px-5 py-3 text-sm shadow-[0_10px_40px_rgba(212,175,55,0.35)]"
          >
            ▸ See it from above
          </button>
          <span className="absolute bottom-5 left-4 rounded-full bg-ocean-950/55 px-2.5 py-1 text-[11px] text-mist-200 backdrop-blur-sm">
            {active + 1} / {frames.length}
          </span>
        </div>

        {/* Thumbnails */}
        <div className="mt-2 grid grid-cols-4 gap-2">
          {frames.map((f, i) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${f.label}`}
              aria-current={i === active}
              className={`relative h-16 overflow-hidden rounded-xl transition md:h-20 ${
                i === active ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100"
              }`}
            >
              <AerialPhoto
                src={f.src}
                alt={f.label}
                fallbackVariant={listing.image}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox — portaled to body to clear the page stacking context */}
      {createPortal(
        lightbox ? (
          <MotionSurface
            variant="gallery"
            ref={lightboxRef}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ocean-950/92 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`${listing.title} photo`}
            onClick={() => setLightbox(false)}
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close photo"
              className="glass absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-mist-100 hover:text-gold"
            >
              ✕
            </button>
            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] w-full">
                <AerialPhoto
                  src={frame.src}
                  alt={`${frame.label} — ${listing.title}`}
                  fallbackVariant={listing.image}
                  className="h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="glass absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-mist-100 hover:text-gold"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="glass absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-mist-100 hover:text-gold"
                >
                  ›
                </button>
                <span className="absolute bottom-4 left-4 rounded-full bg-ocean-950/60 px-3 py-1 text-xs text-mist-200 backdrop-blur-sm">
                  {frame.label}
                  {hasRealPhotos ? "" : " · Sample"}
                </span>
              </div>
            </div>
          </MotionSurface>
        ) : null,
        document.body
      )}
    </>
  );
}
