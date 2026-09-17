/**
 * One frame loop for every shader on the page, riding GSAP's ticker so the
 * delta is already clamped after a stall (a tab switch resumes instead of
 * jumping). Stops itself when nothing is registered, so an idle page burns
 * nothing. Ported from LiveLoveAmelia's gl/ticker.js.
 */
import { ensureGsap } from "../lib/motion/gsap";

type Cb = (timeSec: number, deltaMs: number, frame: number) => void;

let cbs: Cb[] = [];
let clock = 0;
let frame = 0;
let running = false;
const MAX_DT = 33;

function step(dtMs: number) {
  dtMs = dtMs > MAX_DT ? MAX_DT : dtMs;
  clock += dtMs / 1000;
  frame++;
  measure(dtMs);
  for (const fn of cbs.slice()) {
    try {
      fn(clock, dtMs, frame);
    } catch (e) {
      console.warn("[ticker] callback failed, dropping", e);
      remove(fn);
    }
  }
}

const pump = (_t: number, dt: number) => step(dt);

function start() {
  if (running) return;
  running = true;
  ensureGsap().ticker.add(pump);
}
function stop() {
  if (!running) return;
  running = false;
  ensureGsap().ticker.remove(pump);
}

export function add(fn: Cb) {
  if (!cbs.includes(fn)) {
    cbs.push(fn);
    start();
  }
}
export function remove(fn: Cb) {
  cbs = cbs.filter((f) => f !== fn);
  if (!cbs.length) stop();
}
export const time = () => clock;

/* Measured refresh rate, so per-view rates are whole divisors of the panel. */
let hz = 60;
let samples: number[] = [];
let settled = false;
let warmup = 0;
function measure(dt: number) {
  if (settled || dt <= 0) return;
  // Skip the load: sampling from frame one latched 30Hz forever on machines
  // that were merely busy hydrating.
  if (++warmup < 90) return;
  samples.push(dt);
  if (samples.length < 40) return;
  const sorted = samples.slice().sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  if (median > 0) hz = Math.min(240, Math.max(24, Math.round(1000 / median)));
  settled = true;
  samples = [];
}
export const refreshHz = () => hz;

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (cbs.length) start();
  });
}
