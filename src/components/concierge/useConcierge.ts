import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AGENT } from "../../config/agent";
import { sessionId } from "../../lib/netlifyForms";

export type Turn = { role: "user" | "assistant"; content: string; chips?: string[] };
export type ConciergeStatus = "probing" | "ready" | "offline";

/* One transcript per page session, shared between the chat, the handoff
 * card, and the contact form's hidden field. */
let turns: Turn[] = [];
const subs = new Set<() => void>();
function setTurns(next: Turn[]) {
  turns = next;
  subs.forEach((f) => f());
}
function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
const getTurns = () => turns;

export function transcriptText(max = 4000): string {
  const t = turns
    .map((x) => `${x.role === "user" ? "Visitor" : "Concierge"}: ${x.content}`)
    .join("\n\n");
  return t.length > max ? t.slice(t.length - max) : t;
}

export function useConciergeTranscript(): string {
  const current = useSyncExternalStore(subscribe, getTurns, getTurns);
  return current.length ? transcriptText() : "";
}

/** Split the model's trailing `§§ ["q1","q2","q3"]` line into chips. */
function splitChips(text: string): { body: string; chips: string[] } {
  const i = text.lastIndexOf("§§");
  if (i < 0) return { body: text.trim(), chips: [] };
  const body = text.slice(0, i).trim();
  try {
    const arr = JSON.parse(text.slice(i + 2).trim());
    if (Array.isArray(arr))
      return { body, chips: arr.filter((x) => typeof x === "string").slice(0, 3) };
  } catch {
    /* half-streamed or malformed line: drop it */
  }
  return { body, chips: [] };
}

const OFFLINE_COPY = `The concierge is offline right now. Raegan's a text away at ${AGENT.cell}.`;

export function useConcierge() {
  const current = useSyncExternalStore(subscribe, getTurns, getTurns);
  const [status, setStatus] = useState<ConciergeStatus>("probing");
  const [streaming, setStreaming] = useState(false);
  const [replies, setReplies] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Capability probe: the function answers GET with {configured}.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/concierge", { method: "GET" })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => {
        if (!cancelled) setStatus(j?.configured ? "ready" : "offline");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || streaming) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const history = [...turns, { role: "user" as const, content: q }];
      setTurns([...history, { role: "assistant", content: "" }]);
      setStreaming(true);
      let full = "";
      const paint = (text: string, chips?: string[]) => {
        const next = [...history, { role: "assistant" as const, content: text, chips }];
        setTurns(next);
      };
      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            session: sessionId(),
          }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const msg =
            res.status === 429
              ? "Give it a moment — lots of questions coming in. Try again shortly."
              : res.status === 503
                ? OFFLINE_COPY
                : OFFLINE_COPY;
          paint(msg);
          if (res.status === 503) setStatus("offline");
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          full += dec.decode(value, { stream: true });
          // Hide the chip line while it streams in.
          const cut = full.lastIndexOf("§§");
          paint(cut >= 0 ? full.slice(0, cut).trimEnd() : full);
        }
        const { body, chips } = splitChips(full);
        paint(body || OFFLINE_COPY, chips);
        setReplies((n) => n + 1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") paint(OFFLINE_COPY);
        else if (full) paint(splitChips(full).body);
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setStreaming(false);
      }
    },
    [streaming]
  );

  const reset = useCallback(() => {
    stop();
    setTurns([]);
    setReplies(0);
  }, [stop]);

  return { turns: current, status, streaming, replies, ask, stop, reset };
}
