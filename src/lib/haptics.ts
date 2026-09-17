import { prefersReducedMotion } from "./renderMotion";

/**
 * Capability-guarded haptics. A no-op where unsupported (notably iOS Safari,
 * which exposes no Vibration API) and silent under reduced-motion, so callers
 * can fire these freely for tactile feedback without ever gating logic on them.
 */

function canVibrate(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function" &&
    !prefersReducedMotion()
  );
}

function buzz(pattern: number | number[]): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some engines throw if called outside a user gesture — ignore */
  }
}

/** Generic light tap — default touch feedback. */
export function tapHaptic(): void {
  buzz(8);
}

/** Tab/dock switch — a touch crisper than a plain tap. */
export function tabHaptic(): void {
  buzz(10);
}

/** Selection change (filter segment, snap change) — soft confirmation. */
export function selectHaptic(): void {
  buzz(6);
}
