export type ThumbVariant =
  | "marsh"
  | "beach"
  | "harbor"
  | "golf"
  | "grid"
  | "river"
  | "dunes"
  | "canopy";

export interface Community {
  slug: string;
  name: string;
  region: string;
  category: string;
  headline: string;
  buyerFit: string[];
  inventoryStyle: string;
  cta: string;
  /** Lifestyle tags used by index filters */
  tags: string[];
  /** One-line buyer profile shown on cards */
  buyerProfile: string;
  /** Longer place thesis used on detail pages */
  thesis: string[];
  /** Stylized aerial thumbnail variant (fallback if imagery is missing) */
  thumb: ThumbVariant;
  /** Verified coordinates for map pins */
  lat: number;
  lon: number;
  /** Which stitched satellite map best frames this community */
  heroImage: "coast-hero" | "coast-full" | "crane-detail";
}

/** Real aerial thumbnail for a community (stitched Esri World Imagery). */
export function communityPhoto(slug: string): string {
  return `/imagery/communities/${slug}.jpg`;
}

export const communities: Community[] = [
  {
    slug: "crane-island",
    name: "Crane Island",
    region: "Amelia Island",
    category: "Tidal privacy",
    headline:
      "Custom homes, marsh edges, oak canopy, and a quieter form of luxury.",
    buyerFit: ["Privacy", "Architecture", "Marsh", "Custom homes"],
    inventoryStyle: "Custom homes, homesites, marshfront estates",
    cta: "View Crane Island",
    tags: ["Waterfront", "Gated", "New construction"],
    buyerProfile:
      "For buyers who want architecture, marsh, privacy, and a slower relationship with the water.",
    thesis: [
      "Crane Island is not a neighborhood you discover by accident. It sits on the Amelia River side of the island, reached deliberately, organized around marsh, oak canopy, and a small number of homesites.",
      "Value here behaves differently than on the ocean side. It is shaped by privacy, lot orientation toward the tidal marsh, architectural standards, and the simple fact that inventory is structurally limited. There is no volume to absorb demand.",
      "Buyers who choose Crane Island are usually comparing it against oceanfront estates, Plantation golf properties, and private acreage on the mainland, then choosing the river side for quiet, light, and architecture.",
    ],
    thumb: "marsh",
    lat: 30.6135,
    lon: -81.473,
    heroImage: "crane-detail",
  },
  {
    slug: "amelia-island",
    name: "Amelia Island",
    region: "Amelia Island",
    category: "Barrier island living",
    headline:
      "Thirteen miles of beach, marsh, harbor, and history on one barrier island.",
    buyerFit: ["Beach access", "Variety", "Lifestyle", "Long-term value"],
    inventoryStyle:
      "Oceanfront condos, island neighborhoods, marsh homes, historic blocks",
    cta: "View Amelia Island",
    tags: ["Waterfront", "Walkable", "Historic", "Golf"],
    buyerProfile:
      "For buyers who want the full range of island life: ocean, marsh, harbor town, and resort, all in one place.",
    thesis: [
      "Amelia Island is the anchor of this coast: a barrier island in Nassau County where a working harbor town, a historic district, resort communities, and quiet marsh neighborhoods share thirteen miles.",
      "The island's value logic varies block by block. Ocean proximity, walkability to Centre Street, club access, and marsh frontage each price differently, which is exactly why place-level understanding matters more here than anywhere else we work.",
    ],
    thumb: "dunes",
    lat: 30.58,
    lon: -81.444,
    heroImage: "coast-hero",
  },
  {
    slug: "fernandina-beach",
    name: "Fernandina Beach",
    region: "Amelia Island",
    category: "Harbor town",
    headline:
      "A real town with a real harbor: shrimp boats, porches, and beach blocks.",
    buyerFit: ["Town life", "Harbor", "Community", "Beach access"],
    inventoryStyle:
      "In-town homes, beach cottages, newer subdivisions, condos",
    cta: "View Fernandina Beach",
    tags: ["Walkable", "Historic", "Waterfront"],
    buyerProfile:
      "For buyers who want to live in a town, not a development, with the beach a bike ride away.",
    thesis: [
      "Fernandina Beach is the city on Amelia Island's north end: a working harbor town with a marina, a historic core, and neighborhoods that range from Victorian blocks to mid-island subdivisions.",
      "Its inventory is more varied than visitors expect, and value is driven by walkability, lot character, and distance to both the harbor and the beach.",
    ],
    thumb: "harbor",
    lat: 30.6697,
    lon: -81.4626,
    heroImage: "coast-hero",
  },
  {
    slug: "historic-district",
    name: "Historic District",
    region: "Fernandina Beach",
    category: "Walkable and historic",
    headline:
      "Porches, blocks, restaurants, harbor light, and scarce walkable inventory.",
    buyerFit: ["Walkability", "Character", "Downtown", "Scarcity"],
    inventoryStyle: "Historic homes, renovated cottages, infill opportunities",
    cta: "View Historic District",
    tags: ["Historic", "Walkable"],
    buyerProfile:
      "For buyers who measure value in blocks: how many they can walk before dinner.",
    thesis: [
      "The Historic District of Fernandina Beach prices on scarcity and emotion. The supply of true walkable historic blocks near Centre Street is fixed, and it never gets larger.",
      "Buyers here are buying a pattern of life: porches, sidewalks, restaurants, the marina, and a downtown that has been continuously alive since the 1800s.",
    ],
    thumb: "grid",
    lat: 30.6685,
    lon: -81.4615,
    heroImage: "coast-hero",
  },
  {
    slug: "amelia-island-plantation",
    name: "Amelia Island Plantation",
    region: "Amelia Island",
    category: "Golf and beach club",
    headline:
      "Oak canopy, fairways, and the ocean at the island's quiet south end.",
    buyerFit: ["Golf", "Resort amenities", "Canopy", "Security"],
    inventoryStyle:
      "Club homes, villas, oceanfront condos, fairway and marsh lots",
    cta: "View the Plantation",
    tags: ["Golf", "Gated", "Waterfront"],
    buyerProfile:
      "For buyers who want club life under the oaks: golf, beach, and a gate between them and the world.",
    thesis: [
      "Amelia Island Plantation occupies the island's south end, where maritime forest meets the dunes. It is organized around club life: golf, tennis, beach access, and a protected canopy.",
      "Value follows amenity adjacency and view corridors (fairway, marsh, or ocean) and the community's long-standing architectural discipline.",
    ],
    thumb: "golf",
    lat: 30.527,
    lon: -81.45,
    heroImage: "coast-hero",
  },
  {
    slug: "summer-beach",
    name: "Summer Beach",
    region: "Amelia Island",
    category: "Resort coast",
    headline:
      "Resort-adjacent living near the Ritz-Carlton stretch of the island.",
    buyerFit: ["Beach proximity", "Resort services", "Lock-and-leave", "Golf"],
    inventoryStyle: "Villas, condos, single-family homes near the beach",
    cta: "View Summer Beach",
    tags: ["Golf", "Gated", "Waterfront"],
    buyerProfile:
      "For buyers who want the beach and resort services without full club commitment.",
    thesis: [
      "Summer Beach sits along the island's resort corridor, where ocean access, golf, and hotel-grade services shape a lock-and-leave style of ownership.",
      "It attracts second-home buyers who want simplicity: arrive, walk to the beach, leave, and know the place is looked after.",
    ],
    thumb: "beach",
    lat: 30.5942,
    lon: -81.4447,
    heroImage: "coast-hero",
  },
  {
    slug: "wildlight",
    name: "Wildlight",
    region: "Nassau Mainland",
    category: "New construction",
    headline:
      "A growing mainland community built around schools, trails, and new inventory.",
    buyerFit: ["New construction", "Families", "Mainland value", "Growth"],
    inventoryStyle:
      "Newer homes, planned community inventory, family-oriented housing",
    cta: "View Wildlight",
    tags: ["New construction", "Walkable"],
    buyerProfile:
      "For buyers who want new construction, schools, and trail-connected daily life.",
    thesis: [
      "Wildlight is the clearest expression of Nassau County's mainland growth: a planned community built around schools, trails, parks, and a steady pipeline of new homes.",
      "Its value logic is forward-looking. Buyers are pricing what the community is becoming, not only what it is today.",
    ],
    thumb: "canopy",
    lat: 30.6266,
    lon: -81.6408,
    heroImage: "coast-hero",
  },
  {
    slug: "yulee",
    name: "Yulee",
    region: "Nassau Mainland",
    category: "Mainland value",
    headline:
      "Room, growth, and access. The practical center of Nassau County.",
    buyerFit: ["Value", "Space", "Commute access", "Growth"],
    inventoryStyle:
      "Subdivisions, newer construction, acreage, entry and move-up homes",
    cta: "View Yulee",
    tags: ["New construction"],
    buyerProfile:
      "For buyers who want more house and more land while staying minutes from the island.",
    thesis: [
      "Yulee is where Nassau County's growth is most visible: the corridor between I-95 and the island, with new subdivisions, schools, and services filling in year by year.",
      "Buyers trade island adjacency for space and price, and many are betting correctly on the corridor's trajectory.",
    ],
    thumb: "canopy",
    lat: 30.633,
    lon: -81.5815,
    heroImage: "coast-hero",
  },
];

export function getCommunity(slug: string): Community | undefined {
  return communities.find((c) => c.slug === slug);
}

/** Nearby communities — same region first, then straight-line distance. */
export function nearestCommunities(community: Community, n = 3): Community[] {
  const dist = (c: Community) =>
    (c.lat - community.lat) ** 2 + (c.lon - community.lon) ** 2;
  return communities
    .filter((c) => c.slug !== community.slug)
    .sort((a, b) => {
      const sameA = a.region === community.region ? 0 : 1;
      const sameB = b.region === community.region ? 0 : 1;
      if (sameA !== sameB) return sameA - sameB;
      return dist(a) - dist(b);
    })
    .slice(0, n);
}

export const featuredSlugs = [
  "crane-island",
  "historic-district",
  "amelia-island-plantation",
  "summer-beach",
  "wildlight",
  "yulee",
];
