/**
 * SAMPLE DATA — not live inventory.
 *
 * Eight illustrative homes used to design the layout. Every card and detail
 * page badges them "Sample". Live listings come through
 * src/lib/listingsSource.ts (Repliers adapter behind a Netlify function) the
 * moment VITE_USE_LIVE_LISTINGS=true and a board-scoped REPLIERS_API_KEY are
 * set — nothing in the UI changes, the source does.
 */
import { communities } from "./communities";

export interface Listing {
  id: string;
  title: string;
  address: string;
  community: string;
  region: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "Active" | "Under Contract" | "Coming Soon";
  tags: string[];
  image: string;
  lat?: number;
  lng?: number;
  yearBuilt?: number;
  lotSize?: string;
  /** Days since the (sample) list date. */
  listedDaysAgo?: number;
  hoaMonthly?: number;
  taxAnnual?: number;
  /** Real photo URLs when sourced from MLS; sample listings have none and
   *  fall back to aerial imagery in PhotoGallery. */
  photos?: string[];
  /** Short, honest description. Sample copy never names a real address. */
  description?: string;
}

export const listings: Listing[] = [
  {
    id: "sample-crane-marsh",
    title: "Marshfront custom home under the oaks",
    address: "Sample Address · Crane Island",
    community: "Crane Island",
    region: "Amelia Island",
    price: 2850000,
    beds: 4,
    baths: 4,
    sqft: 3650,
    status: "Active",
    tags: ["Waterfront", "Gated", "New construction"],
    image: "marsh",
    yearBuilt: 2022,
    lotSize: "0.62 acres",
    listedDaysAgo: 18,
    hoaMonthly: 295,
    taxAnnual: 24800,
    description:
      "A coastal-cottage plan with deep porches facing the tidal marsh, a screened outdoor room, and a short boardwalk to the community dock. Sample listing for layout purposes.",
  },
  {
    id: "sample-historic-victorian",
    title: "Restored Victorian on a brick-paved block",
    address: "Sample Address · Historic District",
    community: "Historic District",
    region: "Amelia Island",
    price: 1495000,
    beds: 4,
    baths: 3,
    sqft: 2780,
    status: "Under Contract",
    tags: ["Historic", "Walkable"],
    image: "grid",
    yearBuilt: 1898,
    lotSize: "0.18 acres",
    listedDaysAgo: 9,
    taxAnnual: 12400,
    description:
      "Wraparound porch, heart-pine floors, and a carriage-house studio, three blocks from Centre Street. Sample listing for layout purposes.",
  },
  {
    id: "sample-amelia-park",
    title: "Front-porch traditional in Amelia Park",
    address: "Sample Address · Amelia Park",
    community: "Fernandina Beach",
    region: "Amelia Island",
    price: 865000,
    beds: 3,
    baths: 2.5,
    sqft: 2140,
    status: "Active",
    tags: ["Walkable", "New construction"],
    image: "grid",
    yearBuilt: 2015,
    lotSize: "0.11 acres",
    listedDaysAgo: 5,
    hoaMonthly: 90,
    taxAnnual: 6900,
    description:
      "Alley-loaded garage, a real front porch, and the YMCA and Amelia Park shops a short walk away. Sample listing for layout purposes.",
  },
  {
    id: "sample-summer-beach-condo",
    title: "Ocean-view condo on the resort corridor",
    address: "Sample Address · Summer Beach",
    community: "Summer Beach",
    region: "Amelia Island",
    price: 1150000,
    beds: 2,
    baths: 2,
    sqft: 1480,
    status: "Active",
    tags: ["Waterfront", "Gated"],
    image: "dunes",
    yearBuilt: 2001,
    listedDaysAgo: 22,
    hoaMonthly: 980,
    taxAnnual: 9800,
    description:
      "Top-floor corner unit with dune-line views from the balcony and a beach walkover at the end of the drive. Sample listing for layout purposes.",
  },
  {
    id: "sample-plantation-villa",
    title: "Fairway villa in the Plantation",
    address: "Sample Address · Amelia Island Plantation",
    community: "Amelia Island Plantation",
    region: "Amelia Island",
    price: 829000,
    beds: 3,
    baths: 2,
    sqft: 1940,
    status: "Active",
    tags: ["Golf", "Gated"],
    image: "golf",
    yearBuilt: 2006,
    lotSize: "0.12 acres",
    listedDaysAgo: 27,
    hoaMonthly: 410,
    taxAnnual: 7100,
    description:
      "Single-level living under the oak canopy with a lanai over the fairway and club membership available. Sample listing for layout purposes.",
  },
  {
    id: "sample-oceanfront-estate",
    title: "Oceanfront estate at the south end",
    address: "Sample Address · South End",
    community: "Amelia Island",
    region: "Amelia Island",
    price: 4200000,
    beds: 5,
    baths: 5.5,
    sqft: 5100,
    status: "Coming Soon",
    tags: ["Waterfront", "Luxury"],
    image: "dunes",
    yearBuilt: 2010,
    lotSize: "0.9 acres",
    listedDaysAgo: 0,
    taxAnnual: 41000,
    description:
      "Dune-front with a private walkover, a pool terrace facing the Atlantic, and a guest wing over the garage. Sample listing for layout purposes.",
  },
  {
    id: "sample-north-beach-cottage",
    title: "Beach cottage a block off the sand",
    address: "Sample Address · North Beach",
    community: "Fernandina Beach",
    region: "Amelia Island",
    price: 745000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    status: "Active",
    tags: ["Walkable", "Investment"],
    image: "beach",
    yearBuilt: 1978,
    lotSize: "0.2 acres",
    listedDaysAgo: 14,
    taxAnnual: 5600,
    description:
      "Renovated mid-century cottage with an outdoor shower and Main Beach a two-minute walk away. Sample listing for layout purposes.",
  },
  {
    id: "sample-wildlight-new",
    title: "New construction in Wildlight",
    address: "Sample Address · Wildlight",
    community: "Wildlight",
    region: "Nassau Mainland",
    price: 489000,
    beds: 4,
    baths: 3,
    sqft: 2380,
    status: "Active",
    tags: ["New construction", "Walkable"],
    image: "canopy",
    yearBuilt: 2025,
    lotSize: "0.15 acres",
    listedDaysAgo: 31,
    hoaMonthly: 120,
    taxAnnual: 5200,
    description:
      "Builder inventory with a covered lanai, trails to the town center, and the island twenty minutes away. Sample listing for layout purposes.",
  },
];

export function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** $2.85M / $829K style short price for pins. */
export function shortPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  return `$${Math.round(price / 1000)}K`;
}

/** [lon, lat] for the map: the listing's own point, or its community's. */
export function listingLngLat(l: Listing): [number, number] {
  if (typeof l.lat === "number" && typeof l.lng === "number") return [l.lng, l.lat];
  const c = communities.find((x) => x.name === l.community);
  if (c) return [c.lon, c.lat];
  return [-81.4539, 30.6156];
}

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}
