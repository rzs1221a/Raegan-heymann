/**
 * The Aerial Tour — generates a cinematic camera flight for a listing.
 *
 * Each beat is a camera view (lat/lon/zoom/pitch/bearing) plus a dwell duration
 * and a short, HONEST line of context keyed to the listing's tags + its
 * community — never invented specifics (no fabricated distances or features).
 * The AerialTour component drives LiveMapHandle.frame() through these beats.
 *
 * This leans on the one thing a flat photo portal can't do: read a property's
 * value FROM ABOVE — water orientation, privacy, canopy, the walk to town.
 */
import type { Listing } from "../data/listings";
import type { Community } from "../data/communities";
import { listingLngLat } from "../data/listings";

export interface TourBeat {
  key: string;
  lat: number;
  lon: number;
  zoom: number;
  pitch: number;
  bearing: number;
  /** Time the camera holds on this beat (ms), including the fly-in. */
  duration: number;
  eyebrow: string;
  caption: string;
}

const has = (l: Listing, tag: string) => l.tags.includes(tag);

/** Map bearing (deg, 0 = north) from one point toward another. */
function bearingTo(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(toLon - fromLon);
  const y = Math.sin(dLon) * Math.cos(toRad(toLat));
  const x =
    Math.cos(toRad(fromLat)) * Math.sin(toRad(toLat)) -
    Math.sin(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function buildTour(listing: Listing, community?: Community): TourBeat[] {
  const [lon, lat] = listingLngLat(listing);
  const isHomesite = listing.beds === 0 && listing.sqft === 0;
  const beats: TourBeat[] = [];

  // 1 — Approach: a high, slowly-banking orbit so you read the setting.
  beats.push({
    key: "approach",
    lat,
    lon,
    zoom: 14.4,
    pitch: 56,
    bearing: -22,
    duration: 4600,
    eyebrow: "Approach",
    caption: community
      ? `${listing.community}, on the ${community.region} coast, read from the air.`
      : `${listing.community}, read from the air.`,
  });

  // 2 — Water (waterfront only): drop low and angle across the water.
  if (has(listing, "Waterfront")) {
    beats.push({
      key: "water",
      lat,
      lon,
      zoom: 15.1,
      pitch: 70,
      bearing: 38,
      duration: 4800,
      eyebrow: "On the water",
      caption:
        "Orientation to the water is what sets value here. A floor plan never shows this part.",
    });
  }

  // 3 — Privacy & canopy (gated / marsh enclaves): lift overhead.
  if (has(listing, "Gated") || has(listing, "Waterfront")) {
    beats.push({
      key: "privacy",
      lat,
      lon,
      zoom: 15.4,
      pitch: 24,
      bearing: 118,
      duration: 4400,
      eyebrow: "Privacy & canopy",
      caption:
        "From overhead you can see the buffer: the trees, the setbacks, the quiet that surrounds the lot.",
    });
  }

  // 4 — The walk to town (walkable): frame toward the community center.
  if (has(listing, "Walkable") && community) {
    const midLat = (lat + community.lat) / 2;
    const midLon = (lon + community.lon) / 2;
    beats.push({
      key: "walk",
      lat: midLat,
      lon: midLon,
      zoom: 14.1,
      pitch: 52,
      bearing: bearingTo(lat, lon, community.lat, community.lon),
      duration: 4600,
      eyebrow: "Steps from town",
      caption:
        "Walkability you can see: the short, easy line between the front door and where life actually happens.",
    });
  }

  // 5 — On the fairway (golf).
  if (has(listing, "Golf")) {
    beats.push({
      key: "golf",
      lat,
      lon,
      zoom: 15,
      pitch: 46,
      bearing: -64,
      duration: 4200,
      eyebrow: "On the fairway",
      caption:
        "The course as a neighbor: open green frontage that holds light, views, and value.",
    });
  }

  // 6 — Close, in 3D: settle onto the lot itself.
  beats.push({
    key: "site",
    lat,
    lon,
    zoom: 16.1,
    pitch: 62,
    bearing: -34,
    duration: 5200,
    eyebrow: isHomesite ? "The homesite" : "The home",
    caption: isHomesite
      ? "The buildable lot in three dimensions: the canvas, with its setting already in place."
      : `${listing.title}, settled into its setting, in three dimensions.`,
  });

  return beats;
}
