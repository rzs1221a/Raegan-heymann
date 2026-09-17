import { useRef } from "react";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "../lib/renderMotion";

export default function MagneticButton({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  if (prefersReducedMotion()) return <span className={className}>{children}</span>;

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r || !ref.current) return;
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
      }}
    >
      {children}
    </span>
  );
}
