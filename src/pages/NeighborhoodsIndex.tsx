import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { MapMarker } from "../components/LiveMap";
import NeighborhoodCard from "../components/NeighborhoodCard";
import SectionHeader from "../components/SectionHeader";
import SplitWords from "../components/SplitWords";
import {
  neighborhoodRegions,
  neighborhoodsInRegion,
  neighborhoodPath,
  neighborhoods,
} from "../data/neighborhoods.config";
import { useBackgroundFrame } from "../lib/useBackgroundFrame";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useJsonLd } from "../lib/useJsonLd";
import { AGENT } from "../config/agent";

const INDEX_FRAME = { lat: 30.6, lon: -81.5, zoom: 10.6, pitch: 46, bearing: 4 };

export default function NeighborhoodsIndex() {
  const navigate = useNavigate();
  useDocumentTitle(
    "Amelia Island & Yulee Neighborhood Guides",
    "Neighborhood-by-neighborhood guides to Amelia Island, Amelia Island Plantation, and Yulee — schools, amenities, pricing, and homes for sale — from Raegan Heymann."
  );

  const markers = useMemo<MapMarker[]>(
    () =>
      neighborhoods.map((n) => ({
        id: n.slug,
        lat: n.lat,
        lon: n.lon,
        kind: "area" as const,
        label: n.name.split(" & ")[0].split(" — ")[0],
        onClick: () => navigate(neighborhoodPath(n)),
      })),
    [navigate]
  );
  useBackgroundFrame(INDEX_FRAME, markers);

  useJsonLd(
    useMemo(
      () => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Amelia Island & Yulee Neighborhood Guides",
        publisher: { "@type": "RealEstateAgent", name: AGENT.name, url: AGENT.siteUrl },
      }),
      []
    )
  );

  return (
    <>
      <section className="relative z-10 px-4 pb-12 pt-28 md:px-8 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="glass-deep max-w-3xl rounded-[2.25rem] p-6 md:p-10">
            <p className="eyebrow eyebrow-line mb-4">Neighborhood guides</p>
            <SplitWords
              as="h1"
              text="Every neighborhood on the island, one at a time."
              immediate
              className="font-display text-4xl font-medium leading-[1.02] tracking-tight text-mist-100 md:text-6xl"
            />
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist-200 md:text-lg">
              From the Victorian blocks of downtown Fernandina to the gated south-end clubs and the
              new towns rising in Yulee. Schools, amenities, price bands, and the homes for sale in
              each. Raegan has sold in all of them.
            </p>
            <p className="mt-4 text-xs text-mist-400">
              The map behind this page is live: every gold label is a neighborhood you can tap.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-24 md:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          {neighborhoodRegions.map((region) => {
            const items = neighborhoodsInRegion(region.slug);
            return (
              <div key={region.slug} id={region.slug} className="scroll-mt-28">
                <div className="glass-deep rounded-[2rem] p-6 md:p-10">
                  <SectionHeader eyebrow={`${items.length} neighborhoods`} title={region.name} sub={region.tagline} />
                  <p className="mt-6 max-w-3xl text-sm leading-relaxed text-mist-300">{region.intro}</p>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((n) => (
                    <NeighborhoodCard key={n.slug} neighborhood={n} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="glass-deep rounded-[2rem] p-7 text-center md:p-12">
            <p className="eyebrow mb-4">Not sure where to start?</p>
            <h2 className="mx-auto max-w-2xl font-display text-3xl text-mist-100 md:text-4xl">
              Tell the concierge how you want to live. It'll point you at a block.
            </h2>
            <Link to="/#concierge" className="btn-plum mt-7 inline-flex px-7 py-3.5 text-sm">
              Ask the concierge
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
