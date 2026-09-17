// Static prerender for the /neighborhoods squeeze pages.
//
// The app is a client-rendered SPA, which is fine for humans but invisible to
// no-JS crawlers and most AI agents — and these pages exist to win exactly
// that traffic. After `vite build`, this script stamps out a real HTML file
// per neighborhood route from dist/index.html: per-page <title>, meta
// description, canonical/OG tags, schema.org JSON-LD, and the full written
// content injected into #root as semantic HTML. When JS loads, React renders
// over it and the page behaves like the normal SPA. No headless browser, so
// it runs unchanged on Netlify's build image.
//
// It also regenerates dist/sitemap.xml with every prerendered route.
//
// Run: node scripts/prerender.mjs   (wired into `npm run build`)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Netlify exposes the site's primary URL as URL; local builds fall back to
// the production domain so canonicals are never relative.
const agent = JSON.parse(await readFile(path.join(root, "src/config/agent.json"), "utf8"));
const ORIGIN = (process.env.URL || agent.siteUrl).replace(/\/$/, "");

const data = JSON.parse(
  await readFile(path.join(root, "src/data/neighborhoods.json"), "utf8")
);
const template = await readFile(path.join(dist, "index.html"), "utf8");

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const BRAND = agent.name;
const AGENT_LD = {
  "@type": "RealEstateAgent",
  name: agent.name,
  url: `${ORIGIN}/`,
  telephone: agent.cellE164,
  email: agent.email,
  worksFor: { "@type": "Organization", name: agent.office.name, url: agent.office.url },
  address: {
    "@type": "PostalAddress",
    streetAddress: agent.office.street,
    addressLocality: agent.office.city,
    addressRegion: agent.office.state,
    postalCode: agent.office.zip,
    addressCountry: "US",
  },
};

// Flat URLs: /neighborhoods/<slug>. Regions are anchors on the index page.
function regionPath(slug) {
  return `/neighborhoods#${slug}`;
}
function neighborhoodPath(n) {
  return `/neighborhoods/${n.slug}`;
}

/** Swap the template's head tags for page-specific ones. */
function retag(html, { title, description, url }) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${esc(description)}" />`
    )
    .replace(
      /<link rel="canonical"[^>]*\/>/,
      `<link rel="canonical" href="${esc(url)}" />`
    )
    .replace(
      /<meta property="og:title"[^>]*\/>/,
      `<meta property="og:title" content="${esc(title)}" />`
    )
    .replace(
      /<meta property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${esc(description)}" />`
    )
    .replace(
      /<meta property="og:url"[^>]*\/>/,
      `<meta property="og:url" content="${esc(url)}" />`
    )
    .replace(
      /<meta name="twitter:title"[^>]*\/>/,
      `<meta name="twitter:title" content="${esc(title)}" />`
    )
    .replace(
      /<meta name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${esc(description)}" />`
    );
}

/** Inject JSON-LD into <head> and static content into #root. */
function inject(html, jsonLd, body) {
  return html
    .replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"><div style="max-width:52rem;margin:0 auto;padding:6rem 1.25rem;color:#f5f5f0;background:#050505;font-family:Georgia,serif;line-height:1.6">${body}</div></div>`
    );
}

const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: `${ORIGIN}${url}`,
  })),
});

const pages = [];

// Region index
pages.push({
  route: "/neighborhoods",
  title: `Amelia Island & Yulee Neighborhood Guides · ${BRAND}`,
  description:
    "Neighborhood-by-neighborhood guides to Amelia Island, Amelia Island Plantation, and Yulee — schools, amenities, pricing, and homes for sale — from Raegan Heymann, Amelia Island native.",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Amelia Island & Yulee Neighborhood Guides",
    url: `${ORIGIN}/neighborhoods`,
    publisher: AGENT_LD,
  },
  body: `<h1>Amelia Island &amp; Yulee Neighborhood Guides</h1>
${data.regions
  .map(
    (r) => `<h2><a href="${regionPath(r.slug)}" style="color:#d4af37">${esc(r.name)}</a></h2>
<p>${esc(r.tagline)}</p>
<ul>${data.neighborhoods
      .filter((n) => n.region === r.slug)
      .map((n) => `<li><a href="${neighborhoodPath(n)}" style="color:#d4af37">${esc(n.name)}</a> — ${esc(n.tagline)}</li>`)
      .join("")}</ul>`
  )
  .join("\n")}`,
});

// Neighborhood pages
for (const n of data.neighborhoods) {
  const r = data.regions.find((x) => x.slug === n.region);
  const url = `${ORIGIN}${neighborhoodPath(n)}`;
  const live = /^https?:\/\//.test(n.searchUrl);
  pages.push({
    route: neighborhoodPath(n),
    title: `${n.name} Homes for Sale · ${BRAND}`,
    description: n.seoDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Place",
          name: n.name,
          description: n.seoDescription,
          url,
          geo: { "@type": "GeoCoordinates", latitude: n.lat, longitude: n.lon },
          containedInPlace: {
            "@type": "Place",
            name: `${r.name}, Nassau County, Florida`,
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: (n.faqs ?? []).map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
        crumbs([
          ["Neighborhoods", "/neighborhoods"],
          [n.name, neighborhoodPath(n)],
        ]),
        { ...AGENT_LD, areaServed: n.name },
      ],
    },
    body: `<nav><a href="/neighborhoods" style="color:#d4af37">Neighborhoods</a> › <a href="${regionPath(r.slug)}" style="color:#d4af37">${esc(r.name)}</a></nav>
<p style="font-size:.85em;opacity:.8">A neighborhood guide by ${esc(agent.name)}, ${esc(agent.tagline)} · Realtor, ${esc(agent.office.name)} · ${esc(agent.cell)}</p>
<h1>${esc(n.name)}</h1>
<p><em>${esc(n.tagline)}</em></p>
<img src="/imagery/neighborhoods/${n.slug}-hero.jpg" alt="Aerial photograph of ${esc(n.name)}" style="max-width:100%;border-radius:12px" />
<p style="font-size:.8em;opacity:.7">Aerial imagery: Esri, Maxar, Earthstar Geographics</p>
<p>${esc(n.intro)}</p>
<h2>From above</h2>
<p>${esc(n.signature ?? "")}</p>
${(n.distances ?? []).length ? `<p>${n.distances.map((d) => `${esc(d.label)}: ${esc(d.value)}`).join(" · ")}</p>` : ""}
<h2>Schools</h2>
<p>${esc(n.schools)}</p>
<h2>Amenities &amp; lifestyle</h2>
<ul>${n.amenities.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
${(n.photos ?? [])
      .map(
        (p) => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" style="max-width:100%;border-radius:12px" /><figcaption style="font-size:.8em;opacity:.7">${esc(p.alt)} — © ${esc(p.credit)}, ${esc(p.license)}</figcaption></figure>`
      )
      .join("\n")}
<h2>Market snapshot</h2>
<p>${esc(n.priceNote)}</p>
${(n.faqs ?? []).length ? `<h2>Buyer questions</h2>\n${n.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("\n")}` : ""}
${
  live
    ? `<p><a href="${esc(n.searchUrl)}" style="color:#d4af37">View ${esc(n.name)} homes for sale</a></p>`
    : `<p><a href="${esc(agent.office.searchUrl)}" style="color:#d4af37">Search homes for sale</a>, or text ${BRAND} at ${esc(agent.cell)} for current ${esc(n.name)} inventory.</p>`
}
<h2>Nearby neighborhoods</h2>
<ul>${data.neighborhoods
      .filter((s) => s.region === n.region && s.slug !== n.slug)
      .map((s) => `<li><a href="${neighborhoodPath(s)}" style="color:#d4af37">${esc(s.name)}</a></li>`)
      .join("")}</ul>`,
  });
}

for (const page of pages) {
  const html = inject(
    retag(template, {
      title: page.title,
      description: page.description,
      url: `${ORIGIN}${page.route}`,
    }),
    page.jsonLd,
    page.body
  );
  // Flat <route>.html (not <route>/index.html): Netlify serves it directly at
  // the extensionless URL, avoiding the 301 → trailing-slash hop that
  // directory indexes trigger — canonicals and sitemap URLs stay redirect-free.
  const outFile = path.join(dist, `${page.route.slice(1)}.html`);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html);
}

// Sitemap: keep the hand-authored static routes, append the prerendered set.
const STATIC_ROUTES = [
  ["/", "1.0"],
  ["/listings", "0.9"],
  ["/about", "0.8"],
  ["/buy", "0.8"],
  ["/sell", "0.8"],
  ["/contact", "0.6"],
];
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ...STATIC_ROUTES,
  ["/neighborhoods", "0.9"],
  ...data.neighborhoods.map((n) => [neighborhoodPath(n), "0.8"]),
]
  .map(
    ([route, priority]) =>
      `  <url><loc>${ORIGIN}${route}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`
  )
  .join("\n");
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

console.log(`Prerendered ${pages.length} routes + sitemap (${ORIGIN}).`);
