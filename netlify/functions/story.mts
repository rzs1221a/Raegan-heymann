// POST /api/story  { area, address, type, beds, baths, sqft, condition, timeline, upgrades, session }
// Streams a "Listing Story" — how Raegan would position and launch this home.
// Contact details are never sent to the model; they travel with the Netlify form.
import Anthropic from "@anthropic-ai/sdk";
import agent from "../../src/config/agent.json" with { type: "json" };
import { BRIEF, STORY } from "../../src/server/brief.ts";
import { cleanSession, clientIp, limited, streamAnthropic } from "../../src/server/lib.ts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const str = (v: unknown, n = 60) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const clampNum = (v: unknown, lo: number, hi: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? String(n) : "";
};

export default async (req: Request, context: { ip?: string }): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!process.env.ANTHROPIC_API_KEY) return new Response("Concierge not configured", { status: 503 });

  const ip = clientIp(req, context);
  if (limited(ip, 10)) return new Response("Slow down a moment.", { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const h = {
    area: str(b.area, 60),
    address: str(b.address, 120),
    type: str(b.type, 40),
    beds: clampNum(b.beds, 0, 20),
    baths: clampNum(b.baths, 0, 20),
    sqft: clampNum(b.sqft, 0, 20000),
    condition: str(b.condition, 40),
    timeline: str(b.timeline, 40),
    upgrades: str(b.upgrades, 300),
  };
  if (!h.area) return new Response("Need an area", { status: 400 });

  const facts = [
    `Area: ${h.area}`,
    h.address && `Street or neighborhood context: ${h.address}`,
    h.type && `Home type: ${h.type}`,
    (h.beds || h.baths || h.sqft) && `Size: ${h.beds || "?"} bed, ${h.baths || "?"} bath, ${h.sqft || "?"} sq ft`,
    h.condition && `Condition: ${h.condition}`,
    h.timeline && `Timeline to sell: ${h.timeline}`,
    h.upgrades && `Owner mentions: ${h.upgrades}`,
  ]
    .filter(Boolean)
    .join("\n");

  const session = cleanSession(b?.session);
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 900,
    system: `${BRIEF}\n\n${STORY}`,
    messages: [{ role: "user", content: `Write the listing story for this home.\n\n${facts}` }],
  });

  return streamAnthropic(stream, {
    fallbackLine: `(Connection hiccup — Raegan will bring this one in person. ${agent.cell})`,
    onDone: () => {
      if (session) console.log(`[story] ${session} · ${h.area}`);
    },
  });
};

export const config = { path: "/api/story" };
