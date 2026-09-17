import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { animateRenderElement, observeOnce } from "../lib/renderMotion";

type RevealProps = {
  children: ReactNode;
  stagger?: boolean;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "header" | "ul";
};

type RevealComponent = ((props: RevealProps) => ReactNode) & {
  Item: typeof Item;
};

function RevealBase({
  children,
  stagger,
  delay = 0,
  className = "",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    const cleanup = observeOnce(
      el,
      () => {
        void animateRenderElement(el, "surface", "enter", { delay: delay * 1000 });
        if (stagger) {
          Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-item]")).forEach(
            (child, index) => {
              child.style.opacity = "0";
              void animateRenderElement(child, "card", "enter", {
                delay: delay * 1000 + index * 48,
              });
            }
          );
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    return cleanup;
  }, [delay, stagger]);

  return (
    <Tag ref={ref} className={className} data-motion-surface="reveal">
      {children}
    </Tag>
  );
}

function Item({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} data-reveal-item>
      {children}
    </div>
  );
}

const Reveal = RevealBase as RevealComponent;
Reveal.Item = Item;

export default Reveal;
