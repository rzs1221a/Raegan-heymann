import { useEffect, useRef, useState } from "react";
import { observeOnce, prefersReducedMotion } from "../lib/renderMotion";

/**
 * Counts a number up from 0 to `value` the first time it scrolls into view.
 * Reduced-motion users see the final value immediately.
 */
export default function CountUp({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const reduce = prefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let settle = 0;
    const cleanup = observeOnce(
      el,
      () => {
        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setDisplay(t >= 1 ? value : value * ease(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        settle = window.setTimeout(() => setDisplay(value), duration + 400);
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(reduce ? value : display).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
