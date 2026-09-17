import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { MapMarker } from "../components/LiveMap";
import SearchCta from "../components/SearchCta";
import ContactForm from "../components/ContactForm";
import SectionHeader from "../components/SectionHeader";
import {
  getNeighborhoodBySlug,
  getRegion,
  siblingNeighborhoods,
  neighborhoodPath,
  neighborhoodHero,
  regionPath,
} from "../data/neighborhoods.config";
import { scrollBeats } from "../lib/neighborhoodTour";
import { useBackgroundFrame } from "../lib/useBackgroundFrame";
import { useScrollFlight } from "../lib/useScrollFlight";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useJsonLd } from "../lib/useJsonLd";
import { AGENT } from "../config/agent";

const NeighborhoodTour = lazy(() => import("../components/NeighborhoodTour"));

export default function NeighborhoodPage() {
  const { slug } = useParams<{ slug: string }>();
  const neighborhood = slug ? getNeighborhoodBySlug(slug) : undefined;
  const region = neighborhood ? getRegion(neighborhood.region) : undefined;
  const [tourOpen, setTourOpen] = useState(false);

  useDocumentTitle(
    neighborhood ? `${neighborhood.name} Homes for Sale` : "Neighborhoods",
    neighborhood?.seoDescription
  );

  const beats = useMemo(
    () => (neighborhood ? scrollBeats(neighborhood, region) : {}),
    [neighborhood, region]
  );
  const flight = useScrollFlight(beats);

  const frame = useMemo(
    () =>
      neighborhood
        ? { lat: neighborhood.lat, lon: neighborhood.lon, zoom: 14.6, pitch: 60, bearing: -16 }
        : null,
    [neighborhood]
  );
  const markers = useMemo<MapMarker[]>(
    () =>
      neighborhood
        ? [
            {
              id: neighborhood.slug,
              lat: neighborhood.lat,
              lon: neighborhood.lon,
              kind: "area" as const,
              label: neighborhood.name,
              major: true,
              active: true,
            },
          ]
        : [],
    [neighborhood]
  );
  useBackgroundFrame(frame, markers, neighborhood?.slug ?? null);

  useJsonLd(
    useMemo(
      () =>
        neighborhood && region
          ? {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Place",
                  name: neighborhood.name,
                  description: neighborhood.seoDescription,
                  geo: { "@type": "GeoCoordinates", latitude: neighborhood.lat, longitude: neighborhood.lon },
                  containedInPlace: { "@type": "Place", name: `${region.name}, Nassau County, Florida` },
                },
                {
                  "@type": "FAQPage",
                  mainEntity: neighborhood.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Neighborhoods", item: "/neighborhoods" },
                    { "@type": "ListItem", position: 2, name: neighborhood.name, item: neighborhoodPath(neighborhood) },
                  ],
                },
                {
                  "@type": "RealEstateAgent",
                  name: AGENT.name,
                  url: AGENT.siteUrl,
                  telephone: AGENT.cellE164,
                  areaServed: neighborhood.name,
                },
              ],
            }
          : null,
      [neighborhood, region]
    )
  );

  if (!neighborhood || !region) {
    return (
      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-40 text-center">
        <h1 className="text-3xl font-medium">Neighborhood not found</h1>
        <p className="mt-4 text-mist-300">That stretch of the island isn't mapped yet.</p>
        <Link to="/neighborhoods" className="btn-plum mt-8 inline-flex px-6 py-3 text-sm">
          All neighborhoods
        </Link>
      </section>
    );
  }

  const siblings = siblingNeighborhoods(neighborhood);
  const ask = (q: string) => window.dispatchEvent(new CustomEvent("rh:ask", { detail: q }));

  return (
    <>
      <div className="map-app-side-grade pointer-events-none fixed inset-y-0 left-0 z-[1] hidden w-[62%] lg:block" />

      {/* ---- Hero ---- */}
      <section ref={flight("hero")} className="relative z-10 px-4 pb-10 pt-28 md:px-8 lg:min-h-[78svh] lg:pt-32">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.55fr)]">
          <div className="max-w-4xl">
            <div className="glass-deep overflow-hidden rounded-[2.25rem]">
              <div className="relative h-36 md:h-44">
                <img
                  src={neighborhoodHero(neighborhood.slug)}
                  alt={`Aerial photograph of ${neighborhood.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-[rgba(5,5,5,0.25)] to-[rgba(5,5,5,0.35)]" />
                <span className="absolute bottom-3 right-4 text-[9px] uppercase tracking-[0.16em] text-mist-400">
                  Esri · Maxar · Earthstar Geographics
                </span>
              </div>
              <div className="p-6 pt-5 md:p-8 md:pt-6">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
                  <Link to="/neighborhoods" className="pill px-3 py-1.5 text-xs text-mist-300">
                    Neighborhoods
                  </Link>
                  <Link to={regionPath(region)} className="pill px-3 py-1.5 text-xs text-mist-300">
                    {region.name}
                  </Link>
                  <span className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-charcoal">
                    {neighborhood.name}
                  </span>
                </nav>
                <h1 className="mt-6 font-display text-4xl font-medium leading-[1.0] tracking-tight text-mist-100 md:text-6xl">
                  {neighborhood.name}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-200 md:text-xl">{neighborhood.tagline}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <SearchCta neighborhood={neighborhood} />
                  <button type="button" onClick={() => setTourOpen(true)} className="btn-ghost inline-flex items-center gap-2 px-6 py-3.5 text-sm">
                    ◆ Fly this neighborhood
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {neighborhood.distances.map((d) => (
                    <span key={d.label} className="pill px-3.5 py-1.5 text-xs text-mist-200">
                      <span className="text-mist-400">{d.label}</span>{" "}
                      <span className="font-semibold text-mist-100">{d.value}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-mist-300 md:text-base">{neighborhood.intro}</p>
              </div>
            </div>
          </div>

          <aside className="glass-deep h-fit self-start rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <img src={AGENT.headshot.thumb} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-gold/50" />
              <div>
                <p className="text-sm font-medium text-mist-100">{AGENT.name}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold">{AGENT.tagline}</p>
              </div>
            </div>
            <p className="eyebrow mb-5 mt-7">Market snapshot</p>
            <dl className="space-y-5">
              {(
                [
                  ["Area", region.name],
                  ["Price read", neighborhood.priceNote],
                  ["Schools", neighborhood.schools],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-400">{label}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-mist-100">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => ask(`What should I know before buying in ${neighborhood.name}?`)}
              className="btn-ghost mt-6 w-full px-4 py-3 text-xs"
            >
              Ask the concierge about {neighborhood.name.split(" ")[0]}
            </button>
            <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
              Price bands are broad resale reads, refreshed quarterly — not appraisals.
            </p>
          </aside>
        </div>
      </section>

      {/* ---- From above ---- */}
      <section ref={flight("signature")} className="relative z-10 px-4 pb-20 md:px-8 lg:min-h-[52svh]">
        <div className="mx-auto max-w-7xl">
          <div className="glass-deep max-w-2xl rounded-[2rem] p-7 md:p-10">
            <p className="eyebrow eyebrow-line mb-4">From above</p>
            <p className="font-display text-2xl leading-snug text-mist-100 md:text-[1.75rem]">{neighborhood.signature}</p>
            <p className="mt-5 text-xs text-mist-400">
              The map behind this page is live — scroll, and the camera reads the neighborhood with you.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Facts ---- */}
      <section ref={flight("facts")} className="relative z-10 px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="glass-deep rounded-[2rem] p-7 md:p-10">
              <p className="eyebrow mb-4">School zone</p>
              <h2 className="font-display text-2xl text-mist-100 md:text-3xl">Where {neighborhood.name} students go.</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-300 md:text-base">
                {neighborhood.schools} Attendance zones can change — verify current zoning with the Nassau
                County School District before writing an offer around a school.
              </p>
            </div>
            <div className="glass-deep rounded-[2rem] p-7 md:p-10">
              <p className="eyebrow mb-4">Amenities &amp; lifestyle</p>
              <h2 className="font-display text-2xl text-mist-100 md:text-3xl">What living here includes.</h2>
              <ul className="mt-5 space-y-3">
                {neighborhood.amenities.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-mist-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {neighborhood.photos.length > 0 && (
            <div className="glass-deep rounded-[2rem] p-7 md:p-10">
              <p className="eyebrow mb-6">Postcards from {neighborhood.name}</p>
              <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2">
                {neighborhood.photos.map((p) => (
                  <figure key={p.src} className="w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl sm:w-[55%] lg:w-[40%]">
                    <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                    <figcaption className="flex items-baseline justify-between gap-3 px-1 pt-2.5 text-xs text-mist-400">
                      <span className="text-mist-300">{p.alt}</span>
                      <a href={p.creditUrl} target="_blank" rel="noreferrer" className="shrink-0 hover:text-mist-200">
                        © {p.credit} · {p.license}
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="glass-deep rounded-[2rem] p-7 md:p-10">
            <p className="eyebrow mb-4">Buyer questions</p>
            <h2 className="font-display text-2xl text-mist-100 md:text-3xl">What people ask about {neighborhood.name}.</h2>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {neighborhood.faqs.map((f) => (
                <article key={f.q} className="glass rounded-3xl p-6">
                  <h3 className="text-base font-medium leading-snug text-mist-100">{f.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">{f.a}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Listings + Raegan ---- */}
      <section ref={flight("listings")} className="relative z-10 px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-deep rounded-[2rem] p-7 text-center md:p-12">
            <p className="eyebrow mb-4">Live inventory</p>
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-mist-100 md:text-4xl">
              See every home currently for sale in {neighborhood.name}.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist-300">
              Listings open in the brokerage's live MLS search, updated in real time.
            </p>
            <div className="mt-7 flex justify-center">
              <SearchCta neighborhood={neighborhood} />
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-deep rounded-[2rem] p-7 md:p-10">
              <SectionHeader
                eyebrow="Talk to Raegan"
                title={`Someone who knows ${neighborhood.name} street by street.`}
                sub="Timing, pricing, off-market context, and what the band above really means for your search or sale."
              />
            </div>
            <ContactForm
              title={`Ask about ${neighborhood.name}.`}
              cta="Send to Raegan"
              defaultInterest="Buying a home"
              defaultMessage={`I'm interested in ${neighborhood.name}. `}
            />
          </div>
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="relative z-10 seam-top px-4 pb-28 md:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <SectionHeader eyebrow="Nearby" title={`More of ${region.name}.`} />
              <Link to={regionPath(region)} className="btn-ghost px-5 py-2.5 text-xs">
                All of {region.name}
              </Link>
            </div>
            <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((n) => (
                <li key={n.slug}>
                  <Link to={neighborhoodPath(n)} className="group inline-flex items-baseline gap-2 text-sm text-mist-200 transition hover:text-gold">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                    {n.name}
                    <span aria-hidden className="opacity-0 transition group-hover:opacity-100">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tourOpen && (
        <Suspense fallback={null}>
          <NeighborhoodTour neighborhood={neighborhood} region={region} onClose={() => setTourOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
