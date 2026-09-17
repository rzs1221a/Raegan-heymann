/**
 * Repliers MLS adapter — maps the Repliers `/listings` API response onto the
 * app's own `Listing` shape, so the existing UI (cards, search, detail, the
 * Aerial Tour) renders live MLS data with no component changes.
 *
 * This module is pure (no runtime imports from the app) and is consumed BOTH by
 * the Netlify function (server-side, where the API key lives) and, for typing,
 * by the client. The key is NEVER referenced here — the function injects it.
 *
 * NOTE: the key currently on file is Repliers' shared SANDBOX (its listing
 * descriptions literally say "SAMPLE DATA" and it has national coverage with 0
 * inventory in Nassau County / Amelia Island). Point it at a board-scoped
 * (NEFMLS / realMLS) production key before enabling live data — see
 * lib/listingsSource.ts and .env.example.
 */
import type { Listing } from "../data/listings";

export const REPLIERS_BASE = "https://api.repliers.io";
const CDN = "https://cdn.repliers.io";

/** Only the fields we read — everything optional/loose, the API is large. */
export interface RepliersListing {
  mlsNumber?: string;
  status?: string;
  standardStatus?: string;
  lastStatus?: string;
  listPrice?: number | string;
  images?: string[];
  daysOnMarket?: number;
  simpleDaysOnMarket?: number;
  taxes?: { annualAmount?: number | string | null };
  condominium?: { fees?: { maintenance?: number | null } };
  map?: { latitude?: number; longitude?: number };
  address?: {
    streetNumber?: string | null;
    streetName?: string | null;
    streetSuffix?: string | null;
    unitNumber?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    area?: string | null;
    neighborhood?: string | null;
  };
  lot?: { acres?: number | null; squareFeet?: number | null };
  details?: {
    numBedrooms?: number | null;
    numBathrooms?: number | null;
    sqft?: number | string | null;
    yearBuilt?: number | string | null;
    style?: string | null;
    propertyType?: string | null;
    waterfront?: string | null;
    swimmingPool?: string | null;
    HOAFee?: number | string | null;
  };
}

export interface ListingsResult {
  listings: Listing[];
  count: number;
  page: number;
  numPages: number;
}

const num = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : undefined;
};

function mapStatus(r: RepliersListing): Listing["status"] {
  const s = (r.standardStatus ?? "").toLowerCase();
  if (s.includes("coming")) return "Coming Soon";
  if (s.includes("pending") || s.includes("contract")) return "Under Contract";
  if (r.status && r.status !== "A" && !s.includes("active")) {
    // A non-active raw status with no clearer signal → treat as under contract.
    return "Under Contract";
  }
  return "Active";
}

function mapTags(r: RepliersListing): string[] {
  const d = r.details ?? {};
  const tags: string[] = [];
  if (d.waterfront) tags.push("Waterfront");
  const yr = num(d.yearBuilt);
  if (yr && yr >= new Date().getFullYear() - 1) tags.push("New construction");
  return tags;
}

function thumbVariant(r: RepliersListing): string {
  if (r.details?.waterfront) return "marsh";
  const t = `${r.details?.propertyType ?? ""} ${r.details?.style ?? ""}`.toLowerCase();
  if (t.includes("condo") || t.includes("beach")) return "beach";
  return "grid";
}

/** Full CDN photo URLs at a given size class. */
export function photoUrls(r: RepliersListing, size: "medium" | "large" = "large"): string[] {
  return (r.images ?? []).map((p) => `${CDN}/${p}?class=${size}`);
}

/** Map one Repliers listing onto the app's Listing shape. */
export function mapRepliersListing(r: RepliersListing): Listing {
  const a = r.address ?? {};
  const d = r.details ?? {};
  const street = [a.streetNumber, a.streetName, a.streetSuffix]
    .filter(Boolean)
    .join(" ")
    .trim();
  const unit = a.unitNumber ? ` #${a.unitNumber}` : "";
  const locality = [a.city, a.state].filter(Boolean).join(", ");
  const hoa = num(d.HOAFee) ?? r.condominium?.fees?.maintenance ?? undefined;
  const lot = r.lot ?? {};

  return {
    id: r.mlsNumber ?? `repliers-${Math.random().toString(36).slice(2)}`,
    title: street || locality || "Listing",
    address: `${locality}${a.zip ? ` ${a.zip}` : ""}`.trim() || (street + unit),
    community: a.neighborhood || a.city || a.area || "—",
    region: a.area || a.city || a.state || "—",
    price: num(r.listPrice) ?? 0,
    beds: num(d.numBedrooms) ?? 0,
    baths: num(d.numBathrooms) ?? 0,
    sqft: num(d.sqft) ?? 0,
    status: mapStatus(r),
    tags: mapTags(r),
    image: thumbVariant(r),
    lat: r.map?.latitude,
    lng: r.map?.longitude,
    yearBuilt: num(d.yearBuilt),
    lotSize: lot.acres
      ? `${lot.acres} acres`
      : lot.squareFeet
        ? `${Math.round(lot.squareFeet).toLocaleString()} sqft`
        : undefined,
    listedDaysAgo: r.daysOnMarket ?? r.simpleDaysOnMarket,
    hoaMonthly: hoa ?? undefined,
    taxAnnual: num(r.taxes?.annualAmount),
    photos: photoUrls(r),
  };
}

/** Build the Repliers querystring from app-facing search params. */
export function buildListingsQuery(p: {
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
}): string {
  const q = new URLSearchParams();
  const set = (k: string, v: unknown) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  };
  set("search", p.search);
  set("city", p.city);
  set("area", p.area);
  set("state", p.state);
  set("minPrice", p.minPrice);
  set("maxPrice", p.maxPrice);
  set("minBeds", p.minBeds);
  set("status", p.status ?? "A");
  set("pageNum", p.pageNum ?? 1);
  set("resultsPerPage", p.resultsPerPage ?? 24);
  return q.toString();
}
