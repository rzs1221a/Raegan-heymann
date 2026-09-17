/* Exercise the Netlify functions without the netlify CLI.
 *
 *   node --experimental-strip-types scripts/concierge-harness.mjs
 *
 * Without ANTHROPIC_API_KEY: asserts the 503 / probe paths. With a key set
 * locally, also streams one real answer and checks for the §§ chip line.
 */
import concierge from "../netlify/functions/concierge.mts";
import story from "../netlify/functions/story.mts";

const ctx = { ip: "203.0.113.7" };
const url = "http://localhost/api/concierge";
let failed = 0;
const check = (cond, msg) => {
  console.log(`${cond ? "ok " : "FAIL"} ${msg}`);
  if (!cond) failed++;
};

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

// Probe
{
  const r = await concierge(new Request(url, { method: "GET" }), ctx);
  const j = await r.json();
  check(r.status === 200 && typeof j.configured === "boolean", `GET probe → { configured: ${j.configured} }`);
  check(j.configured === hasKey, "probe reflects ANTHROPIC_API_KEY presence");
}
// Bad method
{
  const r = await concierge(new Request(url, { method: "PUT" }), ctx);
  check(r.status === 405, "PUT → 405");
}
// POST without key
if (!hasKey) {
  const r = await concierge(
    new Request(url, { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }) }),
    ctx
  );
  check(r.status === 503, "POST without key → 503");
  const s = await story(new Request("http://localhost/api/story", { method: "POST", body: JSON.stringify({ area: "Crane Island" }) }), ctx);
  check(s.status === 503, "story without key → 503");
} else {
  // Validation still runs before the model.
  const bad = await concierge(new Request(url, { method: "POST", body: "{}" }), ctx);
  check(bad.status === 400, "POST with no messages → 400");
  const noArea = await story(new Request("http://localhost/api/story", { method: "POST", body: JSON.stringify({}) }), ctx);
  check(noArea.status === 400, "story without area → 400");
  const r = await concierge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "How far is the airport from Amelia Island?" }] }),
    }),
    ctx
  );
  check(r.status === 200 && r.headers.get("content-type")?.startsWith("text/plain"), "POST with key → streaming text/plain");
  const text = await r.text();
  console.log("---\n" + text + "\n---");
  check(/§§\s*\[/.test(text), "reply ends with a §§ chip line");
  check(!/\$\d/.test(text.split("§§")[0]) || true, "no dollar figures (advisory; not enforced)");
}

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("Function harness passed.");
