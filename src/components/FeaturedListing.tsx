import { Link } from "react-router-dom";
import type { Listing } from "../data/listings";
import { formatPrice } from "../data/listings";
import { communities, communityPhoto } from "../data/communities";
import { useTilt } from "../lib/motion/useTilt";
import Reveal from "./Reveal";

/**
 * One home, presented editorially: the card floats on the light of its own
 * aerial (blurred, masked backdrop + a blurred echo behind the sharp image).
 */
export default function FeaturedListing({ listing }: { listing: Listing }) {
  const slug = communities.find((c) => c.name === listing.community)?.slug;
  const photo = listing.photos?.[0] ?? communityPhoto(slug ?? "amelia-island");
  const tiltRef = useTilt<HTMLDivElement>(true, 3);
  const isHomesite = listing.beds === 0 && listing.sqft === 0;

  return (
    <div className="relative">
      <div className="featured-backdrop" style={{ backgroundImage: `url(${photo})` }} aria-hidden="true" />
      <Reveal className="relative z-[1]">
        <div className="glass-deep grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.15fr_1fr]">
          <div ref={tiltRef} className="relative min-h-[16rem] overflow-hidden lg:min-h-[26rem]">
            <div className="featured-photo-echo" style={{ backgroundImage: `url(${photo})` }} aria-hidden="true" />
            <img
              src={photo}
              alt={`Aerial view near ${listing.community}`}
              className="featured-drift absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-950/60 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-medium tracking-wide text-charcoal">
              {listing.status}
            </span>
            <span className="absolute bottom-4 right-4 rounded-full bg-ocean-950/60 px-2.5 py-1 text-[10px] text-mist-300 backdrop-blur-sm">
              Sample · not a live listing
            </span>
          </div>
          <div className="flex flex-col justify-center p-7 md:p-10">
            <p className="eyebrow eyebrow-line mb-4">Featured · {listing.community}</p>
            <h3 className="font-display text-3xl leading-tight text-mist-100 md:text-4xl">{listing.title}</h3>
            <p className="mt-3 font-display text-3xl text-gold">{formatPrice(listing.price)}</p>
            <p className="mt-3 text-sm text-mist-300">
              {isHomesite
                ? "Homesite"
                : `${listing.beds} bd · ${listing.baths} ba · ${listing.sqft.toLocaleString()} sqft`}
              {listing.lotSize ? ` · ${listing.lotSize}` : ""}
            </p>
            {listing.description && (
              <p className="mt-5 text-sm leading-relaxed text-mist-300">{listing.description}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {listing.tags.map((t) => (
                <span key={t} className="pill px-3 py-1 text-xs text-mist-300">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/listings/${listing.id}`} className="btn-plum px-6 py-3 text-sm">
                ▸ See it from above
              </Link>
              <Link to="/listings" className="btn-ghost px-6 py-3 text-sm">
                All homes
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
