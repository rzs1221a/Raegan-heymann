import { useEffect, useRef, useState } from "react";
import { AGENT } from "../config/agent";
import { observeOnce } from "../lib/renderMotion";
import { useGsap } from "../lib/motion/gsap";

/**
 * Raegan's portrait blooms in from an ellipse when it scrolls into view,
 * then drifts on a slow ken-burns and parallaxes gently against the scroll.
 */
export default function PortraitBloom({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeOnce(el, () => setInView(true), { rootMargin: "0px 0px -20% 0px" });
  }, []);

  useGsap(ref, (g) => {
    const el = ref.current;
    if (!el) return;
    g.to(el.querySelector("img"), {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  return (
    <div ref={ref} className={`portrait-bloom ${inView ? "is-in" : ""} ${className}`}>
      <img
        src={AGENT.headshot.detail}
        srcSet={`${AGENT.headshot.preview} 640w, ${AGENT.headshot.detail} 1200w`}
        sizes="(min-width: 1024px) 40vw, 90vw"
        alt={`${AGENT.name}, Realtor, on Amelia Island`}
        width={900}
        height={1200}
        loading="lazy"
        decoding="async"
      />
      <div className="absolute bottom-5 left-5 z-[2]">
        <p className="font-display text-2xl text-mist-100">{AGENT.name}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          {AGENT.tagline} · {AGENT.title}
        </p>
      </div>
    </div>
  );
}
