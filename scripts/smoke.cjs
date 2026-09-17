/* Playwright smoke test against the built site (npm run preview on :4173).
 *
 * Exercises the poster path (tile hosts are aborted, like a CI box with no
 * network), asserts the boot gate exits, the concierge falls back to the
 * offline card without a key, the sea band renders (canvas or CSS fallback),
 * no page errors fire, and — crucially — the deck.gl `geo-3d` chunk is never
 * requested without a Google 3D Tiles key.
 *
 * Run: NODE_PATH=$(npm root -g) node scripts/smoke.cjs
 */
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const BASE = process.env.SMOKE_BASE || "http://127.0.0.1:4173";
const OUT = path.join(__dirname, ".out");
fs.mkdirSync(OUT, { recursive: true });

const BLOCK = [/arcgisonline\.com/, /openfreemap\.org/, /googleapis\.com\/v1\/3dtiles/, /tile\.googleapis\.com/];

// The deck.gl chunks are found by content, not name (names are hashed and
// the bundler decides how many there are).
const DIST = path.join(__dirname, "..", "dist", "assets");
const DECK_CHUNKS = fs
  .readdirSync(DIST)
  .filter((f) => {
    if (!f.endsWith(".js")) return false;
    const full = path.join(DIST, f);
    // LiveMap's own chunk names Tile3DLayer in the dynamic import; the real
    // deck.gl payload is the big one.
    return fs.statSync(full).size > 300_000 && /Tile3DLayer/.test(fs.readFileSync(full, "utf8"));
  });
console.log("deck.gl chunks:", DECK_CHUNKS.join(", ") || "(none)");
if (!DECK_CHUNKS.length) console.warn("warn: no deck.gl chunk found in dist (did the build change?)");

async function run() {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium",
    args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
  });
  const failures = [];
  const check = (cond, msg) => {
    if (!cond) failures.push(msg);
    console.log(`${cond ? "ok " : "FAIL"} ${msg}`);
  };

  async function visit(name, url, { width, height, reducedMotion = "no-preference" }) {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion });
    const page = await ctx.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.route("**/*", (route) => {
      const u = route.request().url();
      requests.push(u);
      if (BLOCK.some((re) => re.test(u))) return route.abort();
      if (/\/api\/concierge/.test(u) && route.request().method() === "GET")
        return route.fulfill({ status: 200, contentType: "application/json", body: '{"configured":false}' });
      if (/\/api\//.test(u)) return route.fulfill({ status: 503, body: "Concierge not configured" });
      return route.continue();
    });
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
    // Boot gate must exit within 10s.
    await page.waitForSelector(".startup-gate", { state: "detached", timeout: 10_000 }).catch(() => {});
    const gateGone = (await page.locator(".startup-gate").count()) === 0;
    check(gateGone, `${name}: boot gate exited`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
    // Scroll through so lazy sections + ScrollTriggers run.
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);
    const benign = errors.filter((e) => !/favicon|net::ERR_FAILED|Failed to load resource|WebGL|GL_|swiftshader|maplibre|Tile/i.test(e));
    check(benign.length === 0, `${name}: no page errors${benign.length ? ` (${benign.slice(0, 3).join(" | ")})` : ""}`);
    check(
      !requests.some((u) => DECK_CHUNKS.some((c) => u.endsWith(`/assets/${c}`))),
      `${name}: deck.gl chunk never requested without a key`
    );
    return { page, ctx, requests };
  }

  // Home, desktop
  {
    const { page, ctx } = await visit("home-desktop", "/", { width: 1440, height: 900 });
    check((await page.locator("h1").first().innerText()).includes("Raegan"), "home: hero names Raegan");
    check((await page.locator("text=Ask Raegan directly").count()) > 0, "home: concierge offline card shown without a key");
    const sea = (await page.locator("canvas.sea-canvas").count()) + (await page.locator(".sea-fallback.is-on").count());
    check(sea > 0, "home: sea band rendered (canvas or fallback)");
    check((await page.locator("text=Sample · not a live listing").count()) > 0, "home: sample listings are labelled");
    await page.screenshot({ path: path.join(OUT, "home-desktop-full.png"), fullPage: true });
    await ctx.close();
  }
  // Home, phone
  {
    const { ctx } = await visit("home-mobile", "/?experience=mobile-cinematic", { width: 390, height: 844 });
    await ctx.close();
  }
  // Home, reduced motion
  {
    const { ctx } = await visit("home-reduced", "/", { width: 1280, height: 800, reducedMotion: "reduce" });
    await ctx.close();
  }
  // Neighborhood page + listings
  {
    const { page, ctx } = await visit("neighborhood", "/neighborhoods/historic-downtown", { width: 1440, height: 900 });
    check((await page.locator("h1").first().innerText()).includes("Historic Downtown"), "neighborhood: h1 present");
    await ctx.close();
  }
  {
    const { page, ctx } = await visit("listings", "/listings", { width: 1440, height: 900 });
    check((await page.locator(".listing-card").count()) >= 3, "listings: cards rendered");
    await ctx.close();
  }
  // Prerendered HTML is real HTML (no-JS crawlers).
  {
    const res = await fetch(`${BASE}/neighborhoods/historic-downtown`);
    const html = await res.text();
    check(/<h1>Historic Downtown/.test(html), "prerender: neighborhood page has static h1");
    check(/"@type":"FAQPage"/.test(html), "prerender: FAQPage JSON-LD present");
  }

  await browser.close();
  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll smoke checks passed. Screenshots in scripts/.out/");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
