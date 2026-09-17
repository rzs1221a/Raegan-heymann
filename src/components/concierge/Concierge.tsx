import { useEffect, useRef, useState, type FormEvent } from "react";
import { AGENT, SMS_HREF } from "../../config/agent";
import ConciergeOffline from "./ConciergeOffline";
import HandoffCard from "./HandoffCard";
import { useConcierge } from "./useConcierge";

import { STARTERS } from "./starters";

/**
 * The concierge: a glass chat that streams answers about life on Amelia,
 * offers follow-up chips, and hands the conversation to Raegan as a lead.
 * With no ANTHROPIC_API_KEY on the server it quietly becomes a "text Raegan"
 * card. Any element on the site can dispatch `rh:ask` with a question.
 */
export default function Concierge() {
  const { turns, status, streaming, replies, ask, stop, reset } = useConcierge();
  const [draft, setDraft] = useState("");
  const [handoffDone, setHandoffDone] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem("rh:handoff"));
    } catch {
      return false;
    }
  });
  // Derived, not synced: the card shows after the second reply until dismissed.
  const showHandoff = replies >= 2 && !handoffDone;
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Site-wide "ask" bus (⌘K, cards, neighborhood pages).
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail ?? "";
      document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (q) void ask(q);
      else window.setTimeout(() => inputRef.current?.focus(), 500);
    };
    window.addEventListener("rh:ask", onAsk);
    return () => window.removeEventListener("rh:ask", onAsk);
  }, [ask]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  function finishHandoff() {
    setHandoffDone(true);
    try {
      sessionStorage.setItem("rh:handoff", "1");
    } catch {
      /* ignore */
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = draft;
    setDraft("");
    void ask(q);
  }

  if (status === "offline") return <ConciergeOffline starters={STARTERS} />;

  const last = turns[turns.length - 1];
  const chips = !streaming && last?.role === "assistant" ? last.chips ?? [] : [];

  return (
    <div className="glass-deep rounded-[2rem] p-5 md:p-7">
      <div className="flex items-center gap-4">
        <img
          src={AGENT.headshot.thumb}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/50"
        />
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight text-mist-100">Raegan's Island Concierge</p>
          <p className="flex items-center gap-2 text-xs text-mist-400">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                status === "ready" ? "bg-gold" : "bg-mist-400"
              }`}
            />
            {status === "ready" ? "Answers in seconds · Raegan answers in person" : "Connecting…"}
          </p>
        </div>
        {turns.length > 0 && (
          <button type="button" onClick={reset} className="ml-auto text-xs text-mist-400 hover:text-mist-200">
            Clear
          </button>
        )}
      </div>

      <div
        ref={logRef}
        className="chat-log no-scrollbar mt-5 flex max-h-[46vh] min-h-[9rem] flex-col gap-3 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="pill px-3.5 py-2 text-left text-[13px] text-mist-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            className={`chat-bubble ${t.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}
          >
            {t.content || (
              <span className="chat-typing" aria-label="Thinking">
                <span />
                <span />
                <span />
              </span>
            )}
          </div>
        ))}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void ask(c)}
                className="pill px-3 py-1.5 text-xs text-mist-200"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {showHandoff && !streaming && <HandoffCard onDone={finishHandoff} />}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything about life on Amelia…"
          aria-label="Ask the concierge"
          disabled={status !== "ready"}
          className="input-glass flex-1"
          maxLength={1500}
        />
        {streaming ? (
          <button type="button" onClick={stop} className="btn-ghost px-4 py-3 text-xs">
            Stop
          </button>
        ) : (
          <button type="submit" disabled={status !== "ready" || !draft.trim()} className="btn-plum px-5 py-3 text-xs disabled:opacity-50">
            Ask
          </button>
        )}
      </form>
      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
        General guidance, not legal, tax, or lending advice. No listing prices or
        HOA figures are invented here; Raegan pulls the exact numbers.{" "}
        <a href={SMS_HREF} className="text-mist-300 underline-offset-2 hover:text-gold hover:underline">
          Text her at {AGENT.cell}
        </a>
        .
      </p>
    </div>
  );
}
