import { useLayoutEffect, useRef } from "react";

export type RenderMotionVariant =
  | "route"
  | "surface"
  | "panel"
  | "modal"
  | "sheet"
  | "menu"
  | "gallery"
  | "word"
  | "card";

type MotionPhase = "enter" | "exit";
type RenderMotionPriority = "critical" | "high" | "normal" | "low";
type RenderLoad = "silk" | "steady" | "austere";
type RenderIntent = "idle" | "route" | "map" | "gesture" | "list";

type MotionOptions = {
  duration?: number;
  delay?: number;
  easing?: string;
  interruptKey?: string;
  priority?: RenderMotionPriority;
};

type QueueTask = {
  read?: () => void;
  write?: () => void;
  priority?: RenderMotionPriority;
};

type RenderMotionSnapshot = {
  averageFrameMs: number;
  fps: number;
  intent: RenderIntent;
  load: RenderLoad;
  longFrames: number;
};

type MagneticTweenOptions = {
  duration?: number;
  priority?: RenderMotionPriority;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

const easeMagnetic = "cubic-bezier(0.16, 1, 0.3, 1)";
const easeOut = "cubic-bezier(0.2, 0, 0, 1)";
const easeIn = "cubic-bezier(0.5, 0, 0.75, 0)";
const priorityRank: Record<RenderMotionPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const readQueue: Required<QueueTask>[] = [];
const writeQueue: Required<QueueTask>[] = [];
const activeAnimations = new Map<string, Animation>();
const subscribers = new Set<(snapshot: RenderMotionSnapshot) => void>();
const elementIds = new WeakMap<Element, string>();

let scheduled = false;
let monitorRaf = 0;
let monitorRefs = 0;
let nextElementId = 1;
let lastFrame = 0;
let averageFrameMs = 16.7;
let longFrames = 0;
let load: RenderLoad = "silk";
let intent: RenderIntent = "idle";
let intentUntil = 0;

function noop() {
  return undefined;
}

function nowMs() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function root() {
  return typeof document === "undefined" ? null : document.documentElement;
}

function priorityFor(task: QueueTask): RenderMotionPriority {
  return task.priority ?? "normal";
}

function notify() {
  const snapshot = getRenderMotionSnapshot();
  subscribers.forEach((listener) => listener(snapshot));
}

function syncRootState() {
  const el = root();
  if (!el) return;
  el.dataset.renderEngine = "magnetic";
  el.dataset.renderLoad = load;
  el.dataset.renderIntent = intent;
  el.style.setProperty("--render-motion-scale", String(motionScale()));
}

function updateLoad() {
  const nextIntent = intentUntil > nowMs() ? intent : "idle";
  if (nextIntent !== intent) intent = nextIntent;

  const nextLoad: RenderLoad = prefersReducedMotion()
    ? "austere"
    : averageFrameMs > 28
      ? "austere"
      : averageFrameMs > 20
        ? "steady"
        : "silk";

  if (nextLoad !== load) {
    load = nextLoad;
    notify();
  }
  syncRootState();
}

function monitor(now: number) {
  if (lastFrame) {
    const delta = Math.min(Math.max(now - lastFrame, 8), 120);
    averageFrameMs = averageFrameMs * 0.88 + delta * 0.12;
    if (delta > 50) longFrames += 1;
    updateLoad();
  }
  lastFrame = now;
  monitorRaf = window.requestAnimationFrame(monitor);
}

function frameBudgetMs() {
  if (load === "silk") return 9.5;
  if (load === "steady") return 5.5;
  return 2.75;
}

function flush() {
  scheduled = false;
  const start = nowMs();
  const reads = readQueue.splice(0);
  reads.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  for (const task of reads) task.read();

  const writes = writeQueue.splice(0);
  writes.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  const deferred: Required<QueueTask>[] = [];
  for (const task of writes) {
    const elapsed = nowMs() - start;
    const canDefer =
      task.priority !== "critical" &&
      task.priority !== "high" &&
      elapsed > frameBudgetMs();
    if (canDefer) {
      deferred.push(task);
      continue;
    }
    task.write();
  }

  if (deferred.length) {
    writeQueue.unshift(...deferred);
    scheduled = true;
    window.requestAnimationFrame(flush);
  }
}

function mobileExperience() {
  return root()?.dataset.experience === "mobile-cinematic";
}

function motionScale() {
  if (prefersReducedMotion()) return 0.01;
  if (load === "austere") return 0.62;
  if (load === "steady") return 0.82;
  return 1;
}

function scaledDuration(duration: number) {
  return Math.max(1, Math.round(duration * motionScale()));
}

function variantFrames(variant: RenderMotionVariant, phase: MotionPhase): Keyframe[] {
  const mobile = mobileExperience();
  if (variant === "modal") {
    return phase === "enter"
      ? [
          { opacity: 0, transform: "translate3d(0, 14px, 0) scale(0.985)" },
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        ]
      : [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          { opacity: 0, transform: "translate3d(0, 10px, 0) scale(0.985)" },
        ];
  }
  if (variant === "sheet" || variant === "menu") {
    return phase === "enter"
      ? [
          { opacity: 0, transform: "translate3d(0, 100%, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ]
      : [
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
          { opacity: 0, transform: "translate3d(0, 100%, 0)" },
        ];
  }
  if (variant === "word") {
    return phase === "enter"
      ? [
          { opacity: 0, transform: "translate3d(0, 0.55em, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ]
      : [
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
          { opacity: 0, transform: "translate3d(0, -0.4em, 0)" },
        ];
  }
  if (variant === "gallery") {
    return phase === "enter"
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 1 }, { opacity: 0 }];
  }
  const y = mobile ? 10 : 14;
  const scale = mobile ? 0.992 : 0.985;
  return phase === "enter"
    ? [
        { opacity: 0, transform: `translate3d(0, ${y}px, 0) scale(${scale})` },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      ]
    : [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        {
          opacity: 0,
          transform: `translate3d(0, ${Math.max(6, y - 4)}px, 0) scale(${scale})`,
        },
      ];
}

function finalFrame(frames: Keyframe[]) {
  return frames[frames.length - 1] as Record<string, string | number>;
}

function elementKey(element: Element, prefix: string) {
  const authored = (element as HTMLElement).dataset.motionKey;
  if (authored) return `${prefix}:${authored}`;
  const cached = elementIds.get(element);
  if (cached) return `${prefix}:${cached}`;
  const next = String(nextElementId++);
  elementIds.set(element, next);
  return `${prefix}:${next}`;
}

export function initRenderMotionEngine() {
  if (typeof window === "undefined") return noop;
  monitorRefs += 1;
  syncRootState();
  if (!monitorRaf) {
    lastFrame = 0;
    monitorRaf = window.requestAnimationFrame(monitor);
  }
  return () => {
    monitorRefs = Math.max(0, monitorRefs - 1);
    if (monitorRefs === 0 && monitorRaf) {
      window.cancelAnimationFrame(monitorRaf);
      monitorRaf = 0;
    }
  };
}

export function subscribeRenderMotion(
  listener: (snapshot: RenderMotionSnapshot) => void
) {
  subscribers.add(listener);
  listener(getRenderMotionSnapshot());
  return () => {
    subscribers.delete(listener);
  };
}

export function getRenderMotionSnapshot(): RenderMotionSnapshot {
  return {
    averageFrameMs,
    fps: Math.round(1000 / Math.max(averageFrameMs, 1)),
    intent,
    load,
    longFrames,
  };
}

export function setRenderMotionIntent(nextIntent: RenderIntent, duration = 900) {
  intent = nextIntent;
  intentUntil = Math.max(intentUntil, nowMs() + duration);
  syncRootState();
  notify();
}

export function scheduleRenderMotion(task: QueueTask) {
  if (typeof window === "undefined") {
    task.read?.();
    task.write?.();
    return;
  }
  const priority = priorityFor(task);
  if (task.read) readQueue.push({ read: task.read, write: noop, priority });
  if (task.write) writeQueue.push({ read: noop, write: task.write, priority });
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(flush);
  }
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function animateRenderElement(
  element: Element | null,
  variant: RenderMotionVariant,
  phase: MotionPhase,
  options: MotionOptions = {}
) {
  if (!element || typeof window === "undefined") return Promise.resolve();
  const frames = variantFrames(variant, phase);
  const final = finalFrame(frames);
  const target = element as HTMLElement;
  if (options.interruptKey) {
    activeAnimations.get(options.interruptKey)?.cancel();
  }
  if (prefersReducedMotion() || !("animate" in element)) {
    Object.assign(target.style, final);
    return Promise.resolve();
  }
  const baseDuration =
    options.duration ??
    (phase === "enter"
      ? variant === "sheet" || variant === "menu"
        ? 420
        : 320
      : 180);
  const animation = element.animate(frames, {
    duration: scaledDuration(baseDuration),
    delay: options.delay ?? 0,
    easing: options.easing ?? (phase === "enter" ? easeMagnetic : easeIn),
    fill: "forwards",
  });
  if (options.interruptKey) activeAnimations.set(options.interruptKey, animation);
  return animation.finished
    .catch(() => undefined)
    .then(() => {
      Object.assign(target.style, final);
      if (options.interruptKey && activeAnimations.get(options.interruptKey) === animation) {
        activeAnimations.delete(options.interruptKey);
      }
      animation.cancel();
    });
}

export function runMagneticTween(
  from: number,
  to: number,
  options: MagneticTweenOptions
) {
  if (typeof window === "undefined") {
    options.onUpdate(to);
    options.onComplete?.();
    return noop;
  }
  const duration = scaledDuration(options.duration ?? 420);
  const start = nowMs();
  let cancelled = false;

  const tick = (frameNow: number) => {
    if (cancelled) return;
    const t = Math.min((frameNow - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    scheduleRenderMotion({
      priority: options.priority ?? "high",
      write: () => options.onUpdate(from + (to - from) * eased),
    });
    if (t < 1) {
      window.requestAnimationFrame(tick);
    } else {
      options.onUpdate(to);
      options.onComplete?.();
    }
  };

  window.requestAnimationFrame(tick);
  return () => {
    cancelled = true;
  };
}

export function useSurfaceMotion<T extends HTMLElement>(
  deps: readonly unknown[] = [],
  variant: RenderMotionVariant = "surface"
) {
  const ref = useRef<T | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.motionSurface = variant;
    void animateRenderElement(el, variant, "enter", {
      interruptKey: elementKey(el, variant),
      priority: variant === "modal" || variant === "sheet" ? "high" : "normal",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function useFlipList<T extends HTMLElement>(
  deps: readonly unknown[] = [],
  selector = "[data-motion-id]"
) {
  const ref = useRef<T | null>(null);
  const previous = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    setRenderMotionIntent("list", 420);
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    );
    const next = new Map<string, DOMRect>();
    const writes: Array<() => void> = [];

    for (const element of elements) {
      const id = element.dataset.motionId;
      if (!id) continue;
      const rect = element.getBoundingClientRect();
      next.set(id, rect);
      const old = previous.current.get(id);
      if (!old) {
        writes.push(() => {
          element.animate(
            [
              { opacity: 0, transform: "translate3d(0, 12px, 0) scale(0.992)" },
              { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
            ],
            {
              duration: scaledDuration(280),
              easing: easeMagnetic,
              fill: "both",
            }
          );
        });
        continue;
      }
      const dx = old.left - rect.left;
      const dy = old.top - rect.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      writes.push(() => {
        element.animate(
          [
            { transform: `translate3d(${dx}px, ${dy}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: scaledDuration(360),
            easing: easeOut,
            fill: "both",
          }
        );
      });
    }

    previous.current = next;
    if (writes.length) {
      scheduleRenderMotion({
        priority: "normal",
        write: () => {
          for (const write of writes) write();
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function observeOnce(
  element: Element,
  onEnter: () => void,
  options?: IntersectionObserverInit
) {
  if (!("IntersectionObserver" in window)) {
    onEnter();
    return () => undefined;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    onEnter();
  }, options);
  observer.observe(element);
  return () => observer.disconnect();
}
