import { Link } from "react-router-dom";
import type { Listing } from "../data/listings";
import { formatPrice } from "../data/listings";
import { communities, communityPhoto } from "../data/communities";
import AerialPhoto from "./AerialPhoto";
import { useTilt } from "../lib/motion/useTilt";

const mobileVariant = (v: string) => v === "mobile";

const statusTone: Record<Listing["status"], string> = {
  Active: "bg-gold text-charcoal",
  "Under Contract": "bg-white/12 text-mist-300",
  "Coming Soon": "bg-sand-300/25 text-sand-200",
};

export default function ListingCard({
  listing,
  /** When false (e.g. inside the map search rail) the card does not link out. */
  link = true,
  variant = "default",
  tilt = false,
}: {
  listing: Listing;
  link?: boolean;
  variant?: "default" | "mobile";
  /** Pointer-driven 3D tilt (desktop, fine pointer only). */
  tilt?: boolean;
}) {
  const tiltRef = useTilt<HTMLElement>(tilt && !mobileVariant(variant));
  const isHomesite = listing.beds === 0 && listing.sqft === 0;
  const mobile = variant === "mobile";
  const communitySlug = communities.find(
    (c) => c.name === listing.community
  )?.slug;

  const media = (
    <div className={`relative ${mobile ? "h-full min-h-28" : "h-44"}`}>
      <AerialPhoto
        src={communityPhoto(communitySlug ?? listing.community)}
        alt={`Aerial view near ${listing.community}`}
        fallbackVariant={listing.image}
        className="h-full w-full"
      />
      {!mobile && (
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ${statusTone[listing.status]}`}
        >
          {listing.status}
        </span>
      )}
      {!mobile && (
      <span className="absolute bottom-3 right-4 rounded-full bg-ocean-950/55 px-2.5 py-0.5 text-[10px] text-mist-400 backdrop-blur-sm">
        Sample · not a live listing
      </span>
      )}
    </div>
  );

  const body = (
    <div
      className={`relative rounded-3xl ${
        mobile ? "flex min-w-0 flex-col justify-center py-2 pr-3" : "glass -mt-12 p-5"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p
          className={`text-mist-100 ${
            mobile ? "text-[17px] font-bold tracking-tight" : "text-lg font-semibold"
          }`}
        >
          {formatPrice(listing.price)}
        </p>
        {!mobile && (
          <span className="truncate text-xs text-mist-400">{listing.community}</span>
        )}
      </div>
      <p
        className={`text-mist-200 ${
          mobile ? "mt-0.5 truncate pr-8 text-[13px]" : "mt-1.5 text-sm"
        }`}
      >
        {listing.title}
      </p>
      {!mobile && <p className="mt-1 text-xs text-mist-400">{listing.address}</p>}
      <p
        className={`flex items-center gap-2 text-mist-300 ${
          mobile ? "mt-1 text-[11px]" : "mt-3 text-xs"
        }`}
      >
        {mobile && (
          <span
            className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
              listing.status === "Active"
                ? "bg-gold"
                : listing.status === "Coming Soon"
                  ? "bg-sand-300"
                  : "bg-mist-400"
            }`}
            title={listing.status}
          />
        )}
        {isHomesite
          ? "Homesite"
          : `${listing.beds} bd · ${listing.baths} ba · ${listing.sqft.toLocaleString()} sqft`}
      </p>
      {!mobile && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.tags.map((tag) => (
            <span key={tag} className="pill px-2.5 py-0.5 text-[11px] text-mist-300">
              {tag}
            </span>
          ))}
        </div>
      )}
      {mobile && listing.tags[0] && (
        <p className="mt-1 truncate text-[11px] text-gold/80">{listing.tags[0]}</p>
      )}
    </div>
  );

  return (
    <article
      ref={tiltRef}
      className={`card-hover listing-card relative overflow-hidden rounded-3xl ${
        mobile ? "listing-card-mobile grid grid-cols-[7.25rem_minmax(0,1fr)] gap-2 p-1.5" : ""
      }`}
    >
      {link ? (
        <Link
          to={`/listings/${listing.id}`}
          className={mobile ? "contents" : "block"}
        >
          {media}
          {body}
        </Link>
      ) : (
        <>
          {media}
          {body}
        </>
      )}
    </article>
  );
}
