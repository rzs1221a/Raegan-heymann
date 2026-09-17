import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../renderMotion";

/**
 * Pointer-driven 3D tilt for cards. The tilted element must contain its own
 * media — never put this on a large glass panel that frosts the fixed map
 * behind the page (a transform on a backdrop-filter ancestor breaks the
 * frost). Off for touch, reduced motion, and while the render governor is
 * in "austere".
 */
export function useTilt<T extends HTMLElement>(enabled = true, max = 6) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let rx = 0;
    let ry = 0;
    let hover = false;
    const apply = () => {
      raf = 0;
      el.style.transform = hover
        ? `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
        : "";
    };
    const onMove = (e: PointerEvent) => {
      if (document.documentElement.dataset.renderLoad === "austere") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx = -y * max;
      ry = x * max * 1.2;
      hover = true;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      hover = false;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.classList.add("tilt");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.classList.remove("tilt");
      el.style.transform = "";
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, max]);
  return ref;
}
