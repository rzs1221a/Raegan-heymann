import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global ambient layer behind all content:
 *  - a slow flowing neutral navy gradient tint
 *  - a gold custom cursor (desktop pointer devices only)
 *
 * It sits at negative z-index / fixed, so it never intercepts input. (No
 * particle canvas — the glass blurs the live map directly; the canvas was never
 * needed for that, and dropping it keeps scrolling smooth.)
 */
export default function Atmosphere() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pathname = useLocation().pathname;
  // The color-changing tint fades out on map-app routes (untinted map) and
  // eases back on leave, so it disappears and reappears satisfyingly.
  const tinted = pathname !== "/listings";

  // Gold custom cursor (fine-pointer devices only)
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let active = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;

    const apply = () => {
      raf = 0;
      cursor.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (e: MouseEvent) => {
      if (!active) {
        document.body.classList.add("cursor-active");
        active = true;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      // Always restore visibility — after the pointer leaves and returns, the
      // `active` flag is still true, so this must run every move (not just once)
      // or the cursor stays hidden on re-entry.
      cursor.style.opacity = "1";
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest("a, button, input, select, textarea, [role='button'], label")) {
        document.body.classList.add("cursor-hover");
      } else {
        document.body.classList.remove("cursor-hover");
      }
    };

    const onLeave = () => {
      cursor.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-active", "cursor-hover");
    };
  }, []);

  return (
    <>
      <div
        className="bg-ambient animate-ambient pointer-events-none fixed inset-0 z-[-3] transition-opacity duration-[900ms] ease-out"
        style={{ opacity: tinted ? 1 : 0 }}
      />
      <div id="custom-cursor" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
