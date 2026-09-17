/**
 * Neighborhood flight — cinematic camera beats for a neighborhood, keyed off
 * its thumb variant (the landscape signature: harbor, marsh, golf, dunes…).
 * Same beat shape as listingTour.ts so tour shells stay interchangeable.
 *
 * Two consumers:
 *  - the scroll-driven flight on NeighborhoodPage (each page section flies
 *    the background map to the matching beat), and
 *  - the full-screen NeighborhoodTour overlay ("Fly this neighborhood").
 *
 * Captions stay HONEST: they narrate geography from the config's authored
 * copy — never invented specifics.
 */
import type { Neighborhood, NeighborhoodRegion } from "../data/neighborhoods.config";
import type { TourBeat } from "./listingTour";

/** Feature pass per landscape signature: a low, angled sweep that shows the
 *  thing this neighborhood actually trades on. */
const FEATURE_PASS: Record<string, { zoom: number; pitch: number; bearing: number; eyebrow: string }> = {
  harbor: { zoom: 14.9, pitch: 64, bearing: -48, eyebrow: "The harbor" },
  river: { zoom: 14.6, pitch: 62, bearing: -70, eyebrow: "On the water" },
  marsh: { zoom: 14.7, pitch: 66, bearing: -95, eyebrow: "The marsh" },
  golf: { zoom: 15.0, pitch: 60, bearing: 52, eyebrow: "The fairways" },
  dunes: { zoom: 14.8, pitch: 65, bearing: 78, eyebrow: "The dune line" },
  beach: { zoom: 14.8, pitch: 66, bearing: 84, eyebrow: "The beach" },
  grid: { zoom: 15.1, pitch: 58, bearing: -24, eyebrow: "The plan" },
  canopy: { zoom: 15.2, pitch: 56, bearing: 30, eyebrow: "Under the canopy" },
};

export function buildNeighborhoodTour(
  n: Neighborhood,
  region?: NeighborhoodRegion
): TourBeat[] {
  const pass = FEATURE_PASS[n.thumb] ?? FEATURE_PASS.canopy;
  return [
    {
      key: "approach",
      lat: n.lat,
      lon: n.lon,
      zoom: 12.6,
      pitch: 48,
      bearing: -12,
      duration: 4800,
      eyebrow: "Approach",
      caption: region
        ? `${n.name}, in ${region.name}, read from the air.`
        : `${n.name}, read from the air.`,
    },
    {
      key: "signature",
      lat: n.lat,
      lon: n.lon,
      zoom: pass.zoom,
      pitch: pass.pitch,
      bearing: pass.bearing,
      duration: 5400,
      eyebrow: pass.eyebrow,
      caption: n.signature,
    },
    {
      key: "streets",
      lat: n.lat,
      lon: n.lon,
      zoom: 15.8,
      pitch: 30,
      bearing: pass.bearing + 140,
      duration: 4600,
      eyebrow: "The streets",
      caption: n.tagline,
    },
    {
      key: "settle",
      lat: n.lat,
      lon: n.lon,
      zoom: 15.3,
      pitch: 62,
      bearing: pass.bearing - 30,
      duration: 5200,
      eyebrow: "Live here",
      caption: `${n.priceNote.split(";")[0]}. The current inventory is one tap away.`,
    },
  ];
}

/** Camera beats for the scroll-driven flight — one per page section, derived
 *  from the tour so the page scroll and the overlay tell the same story. */
export function scrollBeats(n: Neighborhood, region?: NeighborhoodRegion) {
  const beats = buildNeighborhoodTour(n, region);
  return {
    hero: beats[0],
    signature: beats[1],
    facts: beats[2],
    listings: beats[3],
  };
}
