/**
 * Single switch-point for listing data.
 *
 * Default: the curated North-Florida SAMPLE listings (src/data/listings.ts).
 * When `VITE_USE_LIVE_LISTINGS=true`, listings come from the Netlify function
 * (/.netlify/functions/listings), which proxies Repliers server-side with the
 * key. Any failure falls back to the sample data, so the UI never breaks.
 *
 * Activation (when a board-scoped NEFMLS/realMLS key is set):
 *   1. set REPLIERS_API_KEY in the Netlify env (server-side, NOT VITE_)
 *   2. set VITE_USE_LIVE_LISTINGS=true
 *   3. switch the pages that import the static `listings` array to call
 *      `fetchListings()` instead (they keep the same Listing shape).
 */
import { listings as sampleListings, type Listing } from "../data/listings";
import type { ListingsResult } from "./repliers";

export const LIVE_LISTINGS =
  import.meta.env.VITE_USE_LIVE_LISTINGS === "true";

export interface ListingQuery {
  search?: string;
  city?: string;
  area?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  status?: string;
  pageNum?: number;
  resultsPerPage?: number;
}

const sampleResult: ListingsResult = {
  listings: sampleListings,
  count: sampleListings.length,
  page: 1,
  numPages: 1,
};

export async function fetchListings(
  query: ListingQuery = {}
): Promise<ListingsResult> {
  if (!LIVE_LISTINGS) return sampleResult;
  try {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const res = await fetch(`/.netlify/functions/listings?${qs}`);
    if (!res.ok) throw new Error(`listings ${res.status}`);
    return (await res.json()) as ListingsResult;
  } catch (err) {
    console.warn("Live listings unavailable — using sample data.", err);
    return sampleResult;
  }
}

export type { Listing };
