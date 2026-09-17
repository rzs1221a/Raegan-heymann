import { useMemo, useRef, type ElementType } from "react";
import { useGsap } from "../lib/motion/gsap";

/**
 * Split-text word reveal: each word rises out of a clipped line on scroll
 * (or immediately, for hero copy). Without GSAP / with reduced motion the
 * words simply render in place.
 */
export default function SplitWords({
  text,
  as = "h2",
  className = "",
  immediate = false,
  delay = 0,
  stagger = 0.035,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Play on mount instead of on scroll (hero). */
  immediate?: boolean;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as ElementType;
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useGsap(
    ref,
    (g) => {
      const el = ref.current;
      if (!el) return;
      const spans = el.querySelectorAll<HTMLElement>(".split-w > span");
      g.set(spans, { yPercent: 110 });
      g.to(spans, {
        yPercent: 0,
        duration: 0.95,
        stagger,
        delay,
        ease: "power4.out",
        ...(immediate ? {} : { scrollTrigger: { trigger: el, start: "top 85%" } }),
      });
    },
    [text, immediate, delay, stagger]
  );

  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          <span className="split-w">
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
