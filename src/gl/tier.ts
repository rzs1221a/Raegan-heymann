/**
 * How much atmosphere this device gets, and the governor that takes it back.
 *   0 — nothing; the CSS fallback stands.
 *   1 — the sea, at the phone profile.
 *   2 — the sea, at the desktop profile.
 * The governor only ever demotes: promoting back after a recovery reads as
 * flicker, and a device that struggled once will struggle again.
 * Ported from LiveLoveAmelia's gl/tier.js.
 */
import { refreshHz } from "./ticker";

type NavX = Navigator & {
  userAgentData?: { mobile?: boolean };
  connection?: { saveData?: boolean };
};

function probe(): number {
  if (typeof window === "undefined") return 0;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) return 0;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return 0;
  }
  const nav = navigator as NavX;
  const cores = nav.hardwareConcurrency || 2;
  const fine = window.matchMedia("(pointer:fine) and (hover:hover)").matches;
  const mobile = nav.userAgentData?.mobile ?? !fine;
  const saveData = nav.connection?.saveData === true;
  if (saveData || mobile || cores <= 4) return 1;
  return 2;
}

let tier = -1;
const listeners: ((t: number) => void)[] = [];

export function get(): number {
  if (tier < 0) tier = probe();
  return tier;
}
export function onChange(fn: (t: number) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}
export function demote(why?: string) {
  if (get() === 0) return;
  tier--;
  console.info(`[gl] stepping down to tier ${tier}${why ? ` (${why})` : ""}`);
  listeners.forEach((f) => {
    try {
      f(tier);
    } catch {
      /* ignore */
    }
  });
}

/* Frame pacing, measured honestly: the frame interval, which includes
 * everything on the page. If frames are long, shedding our work helps
 * whether or not we caused it. */
let ema = 0;
let bad = 0;
export function sample(dtMs: number) {
  const budget = Math.max(20, (1000 / refreshHz()) * 1.7);
  ema = ema ? ema * 0.92 + dtMs * 0.08 : dtMs;
  if (ema > budget) {
    if (++bad >= 180) {
      bad = 0;
      ema = 0;
      demote("sustained frame interval");
    }
  } else bad = Math.max(0, bad - 2);
}

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener?.("change", (e) => {
      if (e.matches && get() > 0) {
        tier = 0;
        listeners.forEach((f) => f(0));
      }
    });
}
