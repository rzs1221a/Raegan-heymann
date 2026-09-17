import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { MapMarker } from "../components/LiveMap";
import ListingCard from "../components/ListingCard";
import SplitWords from "../components/SplitWords";
import { listingLngLat, shortPrice, type Listing } from "../data/listings";
import { fetchListings, LIVE_LISTINGS } from "../lib/listingsSource";
import { backgroundMapRef, setBackgroundMarkers } from "../lib/backgroundMap";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { AGENT } from "../config/agent";

const CHIPS = ["Waterfront", "Gated", "Historic", "New construction", "Golf", "Walkable"] as const;
const BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under $750k", min: 0, max: 750_000 },
  { label: "$750k – $1.5M", min: 750_000, max: 1_500_000 },
  { label: "$1.5M – $3M", min: 1_500_000, max: 3_000_000 },
  { label: "$3M+", min: 3_000_000, max: Infinity },
];

function pad() {
  if (typeof window === "undefined") return undefined;
  if (window.matchMedia("(min-width: 1024px)").matches)
    return { left: Math.round(window.innerWidth * 0.5), top: 120, right: Math.round(window.innerWidth * 0.08), bottom: 60 };
  return { top: 100, bottom: Math.round(window.innerHeight * 0.55), left: 16, right: 16 };
}

/**
 * Homes — the shared background map becomes an interactive search map on the
 * right; the list on the left is what's in view. Sample data until the MLS
 * feed is connected (one env var flips it).
 */
export default function Listings() {
  useDocumentTitle("Homes for sale on Amelia Island", "Homes for sale on Amelia Island, Fernandina Beach, and Yulee from Raegan Heymann.");
  const [params, setParams] = useSearchParams();
  const intent = params.get("intent") ?? "";
  const [all, setAll] = useState<Listing[]>([]);
  const [band, setBand] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchListings().then((r) => {
      if (!cancelled) setAll(r.listings);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const b = BANDS[band];
    return all.filter(
      (l) =>
        l.price >= b.min &&
        l.price < b.max &&
        (!intent || l.tags.some((t) => t.toLowerCase() === intent.toLowerCase()) || l.title.toLowerCase().includes(intent.toLowerCase()))
    );
  }, [all, band, intent]);

  // Light the map with the results and frame them.
  useEffect(() => {
    const markers: MapMarker[] = results.map((l) => {
      const [lon, lat] = listingLngLat(l);
      return {
        id: l.id,
        lat,
        lon,
        kind: "pin",
        chip: shortPrice(l.price),
        label: l.title,
        active: l.id === active,
        onClick: (id) => {
          setActive(id);
          document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        onDblClick: (id) => {
          window.location.assign(`/listings/${id}`);
        },
        onHover: (id) => setActive(id),
      };
    });
    setBackgroundMarkers(markers);
    if (results.length) {
      const lats = results.map((l) => listingLngLat(l)[1]);
      const lons = results.map((l) => listingLngLat(l)[0]);
      const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const lon = (Math.min(...lons) + Math.max(...lons)) / 2;
      const spread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lons) - Math.min(...lons));
      const zoom = spread > 0.15 ? 10.4 : spread > 0.06 ? 11.4 : 12.6;
      const id = window.setTimeout(
        () => backgroundMapRef.current?.frame(lat, lon, { zoom, pitch: 40, bearing: -8, duration: 2200, padding: pad() }),
        120
      );
      return () => window.clearTimeout(id);
    }
    return () => setBackgroundMarkers([]);
  }, [results, active]);

  useEffect(() => () => setBackgroundMarkers([]), []);

  return (
    <>
      <div className="map-app-side-grade pointer-events-none fixed inset-y-0 left-0 z-[1] hidden w-[58%] lg:block" />
      <section className="relative z-10 px-4 pb-28 pt-28 md:px-8 md:pt-32 lg:w-[54%] lg:pb-16">
        <div className="glass-deep rounded-[2rem] p-6 md:p-8">
          <p className="eyebrow eyebrow-line mb-4">Homes</p>
          <SplitWords as="h1" text="On the market, on the map." immediate className="font-display text-4xl leading-[1.02] text-mist-100 md:text-5xl" />
          <p className="mt-4 text-sm leading-relaxed text-mist-300">
            {LIVE_LISTINGS
              ? "Live MLS inventory. Hover a card to find it on the map; tap a pin to find its card."
              : "Sample homes for layout until the MLS feed is connected. Every card is labelled. For live inventory, open the brokerage search."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={intent === c}
                onClick={() => setParams(intent === c ? {} : { intent: c })}
                className={`pill px-3.5 py-1.5 text-xs ${intent === c ? "pill-active" : "text-mist-200"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {BANDS.map((b, i) => (
              <button
                key={b.label}
                type="button"
                aria-pressed={band === i}
                onClick={() => setBand(i)}
                className={`pill px-3.5 py-1.5 text-xs ${band === i ? "pill-active" : "text-mist-300"}`}
              >
                {b.label}
              </button>
            ))}
          </div>
          {!LIVE_LISTINGS && (
            <a href={AGENT.office.searchUrl} target="_blank" rel="noreferrer" className="btn-plum mt-5 inline-flex px-5 py-2.5 text-xs">
              Open live MLS search ↗
            </a>
          )}
        </div>

        <p className="mt-6 text-xs text-mist-400">
          {results.length} home{results.length === 1 ? "" : "s"}
          {intent ? ` · ${intent}` : ""}
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {results.map((l) => (
            <div
              key={l.id}
              id={`card-${l.id}`}
              onPointerEnter={() => setActive(l.id)}
              className={`rounded-3xl transition-shadow ${active === l.id ? "ring-1 ring-gold/60" : ""}`}
            >
              <ListingCard listing={l} tilt />
            </div>
          ))}
        </div>
        {results.length === 0 && (
          <div className="glass mt-6 rounded-3xl p-8 text-center">
            <p className="text-mist-200">Nothing in that band right now.</p>
            <button type="button" onClick={() => { setBand(0); setParams({}); }} className="btn-ghost mt-4 px-5 py-2.5 text-xs">
              Clear filters
            </button>
          </div>
        )}
        <div className="glass-deep mt-10 rounded-3xl p-6">
          <p className="text-sm text-mist-200">Looking for something specific?</p>
          <p className="mt-1 text-xs text-mist-400">Raegan sees homes before they hit the portals.</p>
          <Link to="/contact?interest=Buying%20a%20home" className="btn-plum mt-4 inline-flex px-5 py-2.5 text-xs">
            Tell Raegan what you want
          </Link>
        </div>
      </section>
    </>
  );
}
