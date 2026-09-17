import data from "./neighborhoods.json";
import type { ThumbVariant } from "./communities";

/**
 * Single source of truth for the neighborhood squeeze pages
 * (/neighborhoods/*). The raw records live in neighborhoods.json so the
 * build-time prerender/sitemap script (scripts/prerender.mjs) can read the
 * same data without a TypeScript toolchain; this module adds types and
 * lookups for the app.
 *
 * Go-live per neighborhood: create the saved search / IDX polygon for it,
 * then paste its shareable URL over "PENDING" in neighborhoods.json. Nothing
 * else changes — the CTA switches from "coming soon" to live.
 */

export type RegionSlug =
  | "amelia-island"
  | "amelia-island-plantation"
  | "yulee";

export interface NeighborhoodRegion {
  slug: RegionSlug;
  name: string;
  title: string;
  tagline: string;
  intro: string;
  /** What the aerial view shows — feeds hub hero + tour captions. */
  signature: string;
  lat: number;
  lon: number;
  zoom: number;
  bearing: number;
}

export interface NeighborhoodPhoto {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
  license: string;
}

export interface NeighborhoodDistance {
  label: string;
  value: string;
}

export interface NeighborhoodFaq {
  q: string;
  a: string;
}

export interface Neighborhood {
  slug: string;
  name: string;
  region: RegionSlug;
  tagline: string;
  /** Unique 150–200 word intro — the SEO workhorse. Never duplicate. */
  intro: string;
  schools: string;
  amenities: string[];
  /** Rough resale band. Review quarterly. */
  priceNote: string;
  /** Saved-search / IDX polygon URL for this neighborhood, or "PENDING". */
  searchUrl: string;
  /** Approximate centroid for map framing (not a parcel boundary). */
  lat: number;
  lon: number;
  thumb: ThumbVariant;
  seoDescription: string;
  /** 2–3 sentences: what the aerial actually shows. Feeds the tour + page. */
  signature: string;
  /** Minutes-to chips (beach / downtown / I-95 / airport …). */
  distances: NeighborhoodDistance[];
  /** 3 authored Q&As — rendered on-page and emitted as FAQPage JSON-LD. */
  faqs: NeighborhoodFaq[];
  /** Openly-licensed landmark photos (may be empty — aerials carry the rest). */
  photos: NeighborhoodPhoto[];
}

/** Real stitched Esri aerial for a neighborhood card (fallback: AerialThumb). */
export function neighborhoodPhoto(slug: string): string {
  return `/imagery/neighborhoods/${slug}.jpg`;
}

/** Wide aerial hero band for a neighborhood page. */
export function neighborhoodHero(slug: string): string {
  return `/imagery/neighborhoods/${slug}-hero.jpg`;
}

/** Wide aerial hero for a region hub. */
export function regionHero(slug: string): string {
  return `/imagery/neighborhoods/region-${slug}.jpg`;
}

export const neighborhoodRegions = data.regions as NeighborhoodRegion[];
export const neighborhoods = data.neighborhoods as Neighborhood[];

export function getRegion(slug: string): NeighborhoodRegion | undefined {
  return neighborhoodRegions.find((r) => r.slug === slug);
}

export function getNeighborhood(
  region: string,
  slug: string
): Neighborhood | undefined {
  return neighborhoods.find((n) => n.region === region && n.slug === slug);
}

export function neighborhoodsInRegion(region: string): Neighborhood[] {
  return neighborhoods.filter((n) => n.region === region);
}

/** Sibling neighborhoods in the same region (for internal link equity). */
export function siblingNeighborhoods(current: Neighborhood): Neighborhood[] {
  return neighborhoods.filter(
    (n) => n.region === current.region && n.slug !== current.slug
  );
}

export function isSearchLive(n: Neighborhood): boolean {
  return /^https?:\/\//.test(n.searchUrl);
}

/** Flat URL — one agent's site doesn't need region hub pages. */
export function neighborhoodPath(n: Neighborhood): string {
  return `/neighborhoods/${n.slug}`;
}

/** Region anchors live on the index page. */
export function regionPath(r: NeighborhoodRegion | RegionSlug): string {
  return `/neighborhoods#${typeof r === "string" ? r : r.slug}`;
}

export function getNeighborhoodBySlug(slug: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.slug === slug);
}
