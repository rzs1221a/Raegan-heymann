/**
 * Netlify Function — Repliers MLS proxy.
 *
 * Holds REPLIERS_API_KEY server-side (set it in the Netlify env / local .env,
 * NEVER with a VITE_ prefix) and returns listings already mapped to the app's
 * `Listing` shape. The browser calls /.netlify/functions/listings — it never
 * sees the key or talks to Repliers directly.
 *
 * Allowed query params mirror ListingQuery: search, city, area, state,
 * minPrice, maxPrice, minBeds, status, pageNum, resultsPerPage.
 */
import {
  REPLIERS_BASE,
  buildListingsQuery,
  mapRepliersListing,
  type RepliersListing,
} from "../../src/lib/repliers";

export default async (req: Request): Promise<Response> => {
  const key = process.env.REPLIERS_API_KEY;
  if (!key) {
    return Response.json(
      { error: "REPLIERS_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  const sp = new URL(req.url).searchParams;
  const numParam = (k: string) => {
    const v = sp.get(k);
    return v != null && v !== "" ? Number(v) : undefined;
  };

  const qs = buildListingsQuery({
    search: sp.get("search") ?? undefined,
    city: sp.get("city") ?? undefined,
    area: sp.get("area") ?? undefined,
    state: sp.get("state") ?? undefined,
    minPrice: numParam("minPrice"),
    maxPrice: numParam("maxPrice"),
    minBeds: numParam("minBeds"),
    status: sp.get("status") ?? undefined,
    pageNum: numParam("pageNum"),
    resultsPerPage: numParam("resultsPerPage"),
  });

  try {
    const upstream = await fetch(`${REPLIERS_BASE}/listings?${qs}`, {
      headers: { "REPLIERS-API-KEY": key, Accept: "application/json" },
    });
    if (!upstream.ok) {
      return Response.json(
        { error: `Repliers responded ${upstream.status}` },
        { status: 502 }
      );
    }
    const data = (await upstream.json()) as {
      listings?: RepliersListing[];
      count?: number;
      page?: number;
      numPages?: number;
    };
    const body = {
      listings: (data.listings ?? []).map(mapRepliersListing),
      count: data.count ?? 0,
      page: data.page ?? 1,
      numPages: data.numPages ?? 1,
    };
    return Response.json(body, {
      headers: { "Cache-Control": "public, max-age=120" },
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to reach Repliers.", detail: String(err) },
      { status: 502 }
    );
  }
};
