/** Shared helpers for the Netlify Functions. Server-only. */

/** Cheap per-IP limiter (per function instance; fine for a personal site).
 *  Upgrade path: Netlify Blobs or Upstash if it ever needs to be global. */
const hits = new Map<string, number[]>();
export function limited(ip: string, max = 20): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

export const cleanSession = (s: unknown): string | null =>
  typeof s === "string" && /^[A-Za-z0-9-]{8,64}$/.test(s) ? s : null;

export function clientIp(req: Request, context: { ip?: string }): string {
  return context.ip || req.headers.get("x-nf-client-connection-ip") || "anon";
}

type TextDelta = { type: string; delta?: { type?: string; text?: string } };

/**
 * Pipe an Anthropic message stream out as plain text. `onDone` runs before
 * the stream closes so the invocation stays alive long enough to log.
 */
export function streamAnthropic(
  stream: AsyncIterable<TextDelta> & { controller?: AbortController },
  { onDone, fallbackLine }: { onDone?: (full: string) => Promise<void> | void; fallbackLine: string }
): Response {
  const encoder = new TextEncoder();
  let full = "";
  const readable = new ReadableStream({
    async start(ctrl) {
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
            full += ev.delta.text;
            ctrl.enqueue(encoder.encode(ev.delta.text));
          }
        }
      } catch {
        ctrl.enqueue(encoder.encode(`\n\n${fallbackLine}`));
      } finally {
        try {
          await onDone?.(full);
        } catch {
          /* never fail the response over logging */
        }
        ctrl.close();
      }
    },
    cancel() {
      stream.controller?.abort();
    },
  });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
