import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LiveMap from "../components/LiveMap";
import type { MapMarker } from "../components/LiveMap";
import ListingCard from "../components/ListingCard";
import ContactForm from "../components/ContactForm";
import PhotoGallery from "../components/listing/PhotoGallery";
import MortgageCalculator from "../components/listing/MortgageCalculator";
import AerialTour from "../components/listing/AerialTour";
import { listings, formatPrice, listingLngLat, type Listing } from "../data/listings";
import { communities } from "../data/communities";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { AGENT, CELL_HREF, SMS_HREF } from "../config/agent";

function NotFound() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-40 text-center">
      <p className="eyebrow mb-4">Listing</p>
      <h1 className="text-3xl font-medium text-mist-100">That home isn't in the sample set.</h1>
      <Link to="/listings" className="btn-plum mt-8 inline-flex px-6 py-3 text-sm">
        Back to all homes
      </Link>
    </section>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const listing = listings.find((l) => l.id === id);
  const [tourOpen, setTourOpen] = useState(false);

  useDocumentTitle(
    listing ? `${listing.title} · ${formatPrice(listing.price)}` : "Home",
    listing ? `${listing.title} in ${listing.community}. Sample listing.` : undefined
  );

  const community = useMemo(() => communities.find((c) => c.name === listing?.community), [listing]);
  const similar = useMemo(() => {
    if (!listing) return [] as Listing[];
    const same = listings.filter((l) => l.id !== listing.id && l.community === listing.community);
    const near = listings.filter((l) => l.id !== listing.id && l.community !== listing.community);
    return [...same, ...near].slice(0, 3);
  }, [listing]);

  if (!listing) return <NotFound />;

  const isHomesite = listing.beds === 0 && listing.sqft === 0;
  const [lon, lat] = listingLngLat(listing);
  const marker: MapMarker[] = [{ id: listing.id, lat, lon, kind: "pin", chip: formatPrice(listing.price) }];

  const specs = isHomesite
    ? [{ label: "Homesite", value: "Buildable lot" }]
    : [
        { label: "Bedrooms", value: String(listing.beds) },
        { label: "Bathrooms", value: String(listing.baths) },
        { label: "Interior", value: `${listing.sqft.toLocaleString()} sqft` },
      ];
  const facts: { label: string; value: string; hint?: string }[] = [];
  if (listing.yearBuilt) facts.push({ label: "Year built", value: String(listing.yearBuilt) });
  if (listing.lotSize) facts.push({ label: "Lot size", value: listing.lotSize });
  if (listing.listedDaysAgo != null)
    facts.push({
      label: "On the market",
      value: `${listing.listedDaysAgo} day${listing.listedDaysAgo === 1 ? "" : "s"}`,
      hint: listing.listedDaysAgo <= 7 ? "New" : undefined,
    });
  if (listing.hoaMonthly) facts.push({ label: "HOA / dues", value: `${formatPrice(listing.hoaMonthly)}/mo` });
  if (listing.taxAnnual) facts.push({ label: "Est. taxes", value: `${formatPrice(listing.taxAnnual)}/yr` });

  return (
    <article className="relative z-10 pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <nav className="flex flex-wrap items-center gap-2 pb-5 text-xs text-mist-400">
          <Link to="/listings" className="hover:text-mist-100">Homes</Link>
          <span>/</span>
          <span>{listing.community}</span>
        </nav>

        <PhotoGallery listing={listing} communitySlug={community?.slug} onOpenTour={() => setTourOpen(true)} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow mb-3">{listing.status} · {listing.region}</p>
            <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-mist-100 md:text-4xl">{listing.title}</h1>
            <p className="mt-2 text-sm text-mist-400">{listing.address}</p>
            <p className="mt-5 font-display text-4xl font-medium text-gold">{formatPrice(listing.price)}</p>

            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="glass group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left ring-1 ring-gold/40 transition hover:ring-gold/70"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-charcoal">▸</span>
                <span>
                  <span className="block text-sm font-medium text-mist-100">Take the Aerial Tour</span>
                  <span className="block text-xs text-mist-400">See what makes this location valuable, from above, in 3D.</span>
                </span>
              </span>
              <span className="text-gold transition group-hover:translate-x-1">→</span>
            </button>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center">
                  <p className="text-lg font-semibold text-mist-100">{s.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-mist-400">{s.label}</p>
                </div>
              ))}
            </div>
            {facts.length > 0 && (
              <dl className="glass-card mt-3 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl p-5 sm:grid-cols-3">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-400">{f.label}</dt>
                    <dd className="mt-1 text-sm text-mist-100">
                      {f.value}
                      {f.hint && (
                        <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">{f.hint}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {listing.description && <p className="mt-6 text-sm leading-relaxed text-mist-300">{listing.description}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span key={tag} className="pill px-3 py-1 text-xs text-mist-300">{tag}</span>
              ))}
            </div>
            {community && (
              <div className="glass-deep mt-8 rounded-3xl p-6">
                <p className="eyebrow mb-3">About {listing.community}</p>
                <p className="text-sm leading-relaxed text-mist-300">{community.thesis[0]}</p>
                <Link to="/neighborhoods" className="btn-ghost mt-5 inline-flex px-5 py-2.5 text-sm">
                  Neighborhood guides →
                </Link>
              </div>
            )}
            <div className="mt-8 overflow-hidden rounded-3xl">
              <LiveMap
                initialView={{ center: [lon, lat], zoom: 14, pitch: 48, bearing: -15 }}
                interactive
                markers={marker}
                posterImage={community?.heroImage ?? "coast-hero"}
                dim="none"
                auto3D
                className="h-[42vh] min-h-[300px] w-full"
              />
            </div>
            <p className="mt-2 text-[11px] text-mist-400">Approximate location shown for the sample property.</p>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="glass-deep rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <img src={AGENT.headshot.thumb} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-gold/50" />
                <div>
                  <p className="text-sm font-medium text-mist-100">{AGENT.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold">{AGENT.tagline}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <a href={SMS_HREF} className="btn-plum flex-1 px-4 py-3 text-center text-sm">Text</a>
                <a href={CELL_HREF} className="btn-ghost flex-1 px-4 py-3 text-center text-sm">Call</a>
              </div>
              <button type="button" onClick={() => setTourOpen(true)} className="btn-ghost mt-3 w-full px-4 py-3 text-sm">
                ▸ Aerial Tour
              </button>
            </div>
            <MortgageCalculator listing={listing} />
            <ContactForm
              compact
              title="Request a private showing"
              intro={`Ask Raegan about ${listing.title}.`}
              cta="Request showing"
              defaultInterest="Buying a home"
              defaultMessage={`I'd like to see "${listing.title}" (${listing.community}). `}
            />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="seam-top mt-16 pb-24 pt-12">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl tracking-tight text-mist-100">Similar homes</h2>
              <Link to="/listings" className="btn-ghost px-5 py-2.5 text-sm">All homes →</Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} tilt />
              ))}
            </div>
          </section>
        )}
      </div>

      {tourOpen && <AerialTour listing={listing} community={community} onClose={() => setTourOpen(false)} />}
    </article>
  );
}
