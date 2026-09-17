import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MotionSurface from "./MotionSurface";
import { neighborhoods, neighborhoodPath } from "../data/neighborhoods.config";
import { navLinks } from "../lib/navLinks";
import { SMS_HREF } from "../config/agent";
import { onOpenCommandBar } from "../lib/commandBus";
import { useFocusTrap } from "../lib/useFocusTrap";

const INTENTS = ["Waterfront", "Historic", "Golf", "New construction", "Walkable", "Gated"] as const;

interface Cmd {
  id: string;
  label: string;
  hint: string;
  group: "Neighborhoods" | "Search" | "Pages" | "Raegan";
  keywords: string;
  run: () => void;
}

/**
 * ⌘K command bar — "a place, a price, a life." Fuzzy-jumps to neighborhoods,
 * intent searches, pages, and the concierge. Opens on ⌘/Ctrl-K or via
 * openCommandBar().
 * Keyboard-first, focus-trapped, Escape to close.
 */
export default function CommandBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, () => setOpen(false));

  const commands = useMemo<Cmd[]>(() => {
    const close = () => setOpen(false);
    const go = (to: string) => () => {
      close();
      navigate(to);
    };
    return [
      ...neighborhoods.map((n) => ({
        id: `n-${n.slug}`,
        label: n.name,
        hint: n.tagline.length > 48 ? `${n.tagline.slice(0, 46)}…` : n.tagline,
        group: "Neighborhoods" as const,
        keywords: `${n.name} ${n.region} ${n.tagline} ${n.amenities.join(" ")}`,
        run: go(neighborhoodPath(n)),
      })),
      ...INTENTS.map((intent) => ({
        id: `i-${intent}`,
        label: intent,
        hint: "Search homes",
        group: "Search" as const,
        keywords: `${intent} search homes listings`,
        run: go(`/listings?intent=${encodeURIComponent(intent)}`),
      })),
      ...navLinks.map((l) => ({
        id: `p-${l.to}`,
        label: l.label,
        hint: l.to,
        group: "Pages" as const,
        keywords: l.label,
        run: go(l.to),
      })),
      {
        id: "ask",
        label: "Ask the concierge",
        hint: "Anything about life on Amelia",
        group: "Raegan" as const,
        keywords: "ask question concierge chat help schools flood insurance",
        run: () => {
          close();
          navigate("/#concierge");
          window.dispatchEvent(new CustomEvent("rh:ask", { detail: "" }));
        },
      },
      {
        id: "text",
        label: "Text Raegan",
        hint: "Opens Messages",
        group: "Raegan" as const,
        keywords: "text call phone sms contact",
        run: () => {
          close();
          window.location.href = SMS_HREF;
        },
      },
    ];
  }, [navigate]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands;
    return commands
      .map((c) => {
        const hay = `${c.label} ${c.keywords}`.toLowerCase();
        const i = hay.indexOf(term);
        if (i < 0) return null;
        // Prefer label-start matches.
        const score = c.label.toLowerCase().startsWith(term) ? 0 : i + 1;
        return { c, score };
      })
      .filter((x): x is { c: Cmd; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.c);
  }, [q, commands]);

  // Open via ⌘K / Ctrl-K and via the bus (hero search).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) {
            setQ("");
            setActive(0);
          }
          return !v;
        });
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = onOpenCommandBar((query) => {
      setQ(query);
      setActive(0);
      setOpen(true);
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  }

  if (!open) return null;

  return (
        <MotionSurface
          variant="modal"
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command menu"
        >
          <div
            className="absolute inset-0 bg-ocean-950/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <MotionSurface
            variant="modal"
            ref={panelRef}
            className="glass-deep relative w-full max-w-xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="text-gold">⌕</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search a place, a price, or a life"
                aria-label="Search a place, a price, or a life"
                className="w-full bg-transparent text-base text-mist-100 placeholder:text-mist-400 focus:outline-none"
              />
              <kbd className="hidden rounded-md border border-white/15 px-2 py-0.5 text-[10px] text-mist-400 sm:block">
                ESC
              </kbd>
            </div>

            <div className="no-scrollbar max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-mist-400">
                  Nothing matches “{q}”.
                </p>
              )}
              {results.map((c, idx) => {
                const showGroup = c.group !== results[idx - 1]?.group;
                return (
                  <div key={c.id}>
                    {showGroup && (
                      <p className="eyebrow px-5 pb-1.5 pt-3 text-[10px]">
                        {c.group}
                      </p>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => c.run()}
                      className={`flex w-full items-center justify-between gap-3 px-5 py-2.5 text-left transition-colors ${
                        idx === active ? "bg-gold/15" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="text-sm text-mist-100">{c.label}</span>
                      <span className="shrink-0 text-xs text-mist-400">
                        {c.hint}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </MotionSurface>
        </MotionSurface>
  );
}
