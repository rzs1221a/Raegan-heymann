# Raegan Heymann · raeganheymann.com

The personal site of Raegan Heymann — Realtor, co-owner of Berkshire Hathaway HomeServices Heymann Williams Realty, and Amelia Island native.

Built in the "Aerial" design language of the Heymann Williams coastal concept: a single live satellite map is the floor of every page, navigation is a camera flight, scrolling the island is a flyover, everything else floats on liquid glass with one gold accent. On top of that: a hand-written WebGL Atlantic, GSAP scroll choreography, an AI concierge that hands conversations to Raegan as leads, and a seller stepper that writes a Listing Story.

## Stack

- Vite 8 · React 19 · TypeScript 6 · Tailwind v4 (tokens live in `@theme` in `src/index.css`; there is no `tailwind.config`)
- MapLibre GL 4.7 (Esri World Imagery + OpenFreeMap building extrusions, both key-free)
- deck.gl 9 + Google Photorealistic 3D Tiles — optional, dynamically imported only when a key is set
- GSAP 3 + ScrollTrigger (npm) for scroll-linked motion; coastal's CSS/WAAPI for state transitions
- Netlify: static `dist/`, Functions (`netlify/functions/*.mts`, esbuild), Forms

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build && prerender (23 routes + sitemap)
npm run lint
npm run preview -- --port 4173
```

Verification used before every push:

```bash
NODE_PATH=$(npm root -g) node scripts/smoke.cjs      # Playwright: boot, poster path, offline concierge, no deck.gl without a key
npm run test:concierge                               # function harness: probe / 503 / 400 paths (streams a real answer if ANTHROPIC_API_KEY is set)
```

Screenshots land in `scripts/.out/`.

## Environment variables

Copy `.env.example`. All optional — the site is complete without any of them.

| Variable | Where | Effect |
|---|---|---|
| `ANTHROPIC_API_KEY` | Netlify (server) | Turns the concierge and the Listing Story on. Absent → the chat becomes a "Text Raegan" card and the stepper still sends the lead. |
| `ANTHROPIC_MODEL` | Netlify (server) | Defaults to `claude-haiku-4-5`. |
| `VITE_GOOGLE_3D_TILES_KEY` | build-time | Google Map Tiles API key → photoreal 3D on close-ups (neighborhood flyovers, listing tours). Without it the map stays on OSM extrusions. Restrict the key to Map Tiles API + your domains. |
| `REPLIERS_API_KEY` + `VITE_USE_LIVE_LISTINGS=true` | Netlify (server) + build | Flips `/listings` from sample data to the MLS proxy (`netlify/functions/listings.mts`). Needs a board-scoped NEFMLS key; the sandbox key has no Nassau County inventory. |

Cost note: the concierge runs on Haiku with ~700 output tokens per turn — roughly $0.002–0.005 per answer. A thousand conversations a month is on the order of $10–25.

## Where things live

```
src/config/agent.json      ← Raegan's facts. ONE source. Read by the app, the prerender script, and the concierge brief.
src/data/neighborhoods.json  22 neighborhood guides (intros, FAQs, distances, licensed photos + credits). searchUrl "PENDING" until a saved search exists.
src/data/listings.ts       8 SAMPLE homes, labelled on every card. Swapped for MLS by env var, not code.
src/data/testimonials.ts   Empty on purpose. The section renders nothing until real quotes exist.
src/server/brief.ts        The concierge system prompt. `rules` (Fair Housing, no invented numbers) and `format` are locked.
netlify/functions/         concierge.mts (/api/concierge), story.mts (/api/story), listings.mts
public/forms.html          Static twins of the three Netlify forms. See "Forms" below.
scripts/prerender.mjs      Stamps real HTML + JSON-LD per neighborhood into dist/ and regenerates sitemap.xml.
src/gl/ + SeaCanvas.tsx    The WebGL ocean and its governor.
src/lib/motion/            GSAP registration, useGsap (StrictMode-safe), useTilt.
src/components/LiveMap.tsx The MapLibre plate; BackgroundMap.tsx mounts it once behind every page.
```

## Forms

Three Netlify forms: `contact`, `concierge-lead`, `valuation`. Netlify's build-time parser needs a static `<form>` per name, so they are mirrored in `public/forms.html`.

**If you add a field to a React form, add it to the twin or it is dropped silently.**

- Enable form detection in Site settings → Forms before the first deploy, then add an email notification to Raegan.
- Every submission carries the exact consent text (`consent_text`), a timestamp, the page URL, and a session id.
- The contact form also carries the concierge transcript (`concierge_context`), so Raegan reads the conversation before she calls.
- Dev servers do not accept form POSTs. Test on a Deploy Preview.

## Before launch — CONFIRM with Raegan

Everything below ships with a placeholder or an assumption and is marked in `src/config/agent.json`:

- [ ] Production domain (`siteUrl`) — canonical, OG, sitemap, robots all read it
- [ ] Stats: closed-sales count, years, the top-producer year range
- [ ] Cell number and email are the ones she wants public
- [ ] Bio paragraphs (written from public facts; she should read them)
- [ ] Florida license number (`license`, currently empty)
- [ ] Testimonials she has permission to publish
- [ ] Per-neighborhood saved-search URLs (`searchUrl` in `neighborhoods.json`), or leave the island-wide search
- [ ] Set `ANTHROPIC_API_KEY` if she wants the concierge live; read the brief in `src/server/brief.ts` first
- [ ] A real OG image (currently the brokerage's coastal aerial)

## Honesty rules baked in

- Sample listings are labelled on every card, on detail pages, and in the footer.
- The concierge never invents prices, HOA fees, taxes, insurance quotes, or school ratings, and follows Fair Housing (locked prompt fields).
- The Listing Story never states a price or a percentage of value.
- Testimonials are empty until real.
- No fabricated photography: every image is stitched satellite imagery (Esri) or an openly licensed photo, credited in place.

## Performance and accessibility

- Experience profiles (`src/lib/experienceProfile.ts`): phones run without the persistent map, with lower DPR, no orbit, and scaled motion.
- Render governor (`src/lib/renderMotion.ts`): measures frame rate and steps glass blur, transitions, the sea, and card transforms down under load. `?motionHud=1` shows it.
- Sea governor (`src/gl/tier.ts`): sheds pixels before it sheds the ocean; demote-only.
- `prefers-reduced-motion` stops every animation, including the map flights (which jump instead).
- Poster fallback: the stitched aerial paints first and stays if WebGL or tiles fail.
- deck.gl (1.8 MB) is loaded only past zoom 15.2 and only with a Google key; the smoke test asserts it.
- Skip link, focus-visible gold ring, focus traps on dialogs, `aria-live` on the chat and the boot gate, safe-area padding on the mobile dock.

## Credits

Map imagery © Esri, Maxar, Earthstar Geographics, GIS User Community. Buildings © OpenStreetMap contributors via OpenFreeMap. Photorealistic tiles, where shown, © Google. Neighborhood photography from Wikimedia Commons contributors and the Library of Congress Highsmith Archive under their licenses, credited beside each photo. Design language and map engine ported from the Heymann Williams coastal concept; ocean shader, concierge pattern, and scroll choreography ported from LiveLoveAmelia; lead-consent and featured-listing treatments from Sold on Amelia Island.
