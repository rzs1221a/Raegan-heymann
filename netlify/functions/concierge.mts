// GET  /api/concierge            → { configured: boolean }   (client capability probe)
// POST /api/concierge  { messages: [{role, content}], session? }
// Streams plain text back (text/plain; chunked). Client appends deltas.
import Anthropic from "@anthropic-ai/sdk";
import agent from "../../src/config/agent.json" with { type: "json" };
import { BRIEF } from "../../src/server/brief.ts";
import { cleanSession, clientIp, limited, streamAnthropic } from "../../src/server/lib.ts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const MAX_TURNS = 16;
const MAX_CHARS = 1500;

type Msg = { role: "user" | "assistant"; content: string };

export default async (req: Request, context: { ip?: string }): Promise<Response> => {
  const configured = Boolean(process.env.ANTHROPIC_API_KEY);
  if (req.method === "GET") {
    return Response.json({ configured }, { headers: { "Cache-Control": "no-store" } });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!configured) return new Response("Concierge not configured", { status: 503 });

  const ip = clientIp(req, context);
  if (limited(ip)) return new Response("Slow down a moment.", { status: 429 });

  let body: { messages?: unknown; session?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const messages: Msg[] = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(
      (m: Partial<Msg>): m is Msg =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return new Response("Need a user message", { status: 400 });

  const session = cleanSession(body?.session);
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 700,
    system: BRIEF,
    messages,
  });

  return streamAnthropic(stream, {
    fallbackLine: `(Connection hiccup — try again, or text Raegan at ${agent.cell}.)`,
    onDone: () => {
      if (session) console.log(`[concierge] ${session} · ${messages.length} turns`);
    },
  });
};

export const config = { path: "/api/concierge" };
