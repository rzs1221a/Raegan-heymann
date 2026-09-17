import { useRef } from "react";
import { useGsap } from "../lib/motion/gsap";

/** A one-pixel gold hairline along the top edge that fills as you scroll. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  useGsap(ref, (g) => {
    const el = ref.current;
    if (!el) return;
    g.set(el, { scaleX: 0, transformOrigin: "0 50%" });
    g.to(el, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
    });
  });
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
