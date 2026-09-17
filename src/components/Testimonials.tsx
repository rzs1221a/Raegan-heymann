import { useEffect, useState } from "react";
import { testimonials } from "../data/testimonials";
import { prefersReducedMotion } from "../lib/renderMotion";
import SectionHeader from "./SectionHeader";

/** Rotating client words. Renders nothing until real testimonials exist. */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  useEffect(() => {
    if (n < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => window.clearInterval(id);
  }, [n]);
  if (n === 0) return null;
  const t = testimonials[i];
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeader eyebrow="Client words" title="What people say after closing." />
      <div className="glass-deep mt-10 rounded-[2rem] p-8 md:p-12">
        <p key={i} className="accent-serif fade-up text-2xl leading-relaxed md:text-3xl">“{t.quote}”</p>
        <p className="mt-6 text-sm text-mist-300">
          — {t.name}
          {t.context ? `, ${t.context}` : ""}
        </p>
        {n > 1 && (
          <div className="mt-6 flex gap-2">
            {testimonials.map((_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Testimonial ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 w-8 rounded-full ${k === i ? "bg-gold" : "bg-white/20"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
