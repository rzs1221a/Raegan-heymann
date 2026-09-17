import { useEffect, useRef, useState } from "react";
import { animateRenderElement, prefersReducedMotion } from "../lib/renderMotion";

/**
 * Cycles a single word in place — "a place / a price / a life". The container
 * sizes to the widest word (rendered invisibly) so the line never reflows.
 * Reduced-motion shows the first word, static.
 */
export default function IntentRotator({
  words,
  interval = 2600,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const reduce = prefersReducedMotion();
  const [i, setI] = useState(0);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduce, words.length, interval]);

  useEffect(() => {
    void animateRenderElement(wordRef.current, "word", "enter", { duration: 420 });
  }, [i]);

  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className={`relative inline-grid align-baseline ${className}`}>
      {/* Reserve width for the widest word, no layout shift */}
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {widest}
      </span>
      <span className="col-start-1 row-start-1">
        <span ref={wordRef} className="inline-block text-gold">
          {reduce ? words[0] : words[i]}
        </span>
      </span>
    </span>
  );
}
