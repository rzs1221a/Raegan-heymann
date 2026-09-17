import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import { preloadEverything } from "../lib/appPreload";

type BootState = {
  ready: boolean;
  exiting: boolean;
  saver: boolean;
};

export default function StartupGate() {
  const [boot, setBoot] = useState<BootState>(() => ({
    ready: false,
    exiting: false,
    saver: false,
  }));

  const visible = boot.saver || !boot.ready || boot.exiting;

  useEffect(() => {
    let cancelled = false;
    let startFrame = 0;
    let exitTimer = 0;

    startFrame = window.requestAnimationFrame(() => {
      setBoot({ ready: false, exiting: false, saver: false });

      void preloadEverything().then(() => {
        if (cancelled) return;
        setBoot({ ready: true, exiting: true, saver: false });
        // The map listens for this and launches the hero flight, so the
        // blackout dissolves onto a camera that is already moving.
        window.dispatchEvent(new CustomEvent("rh:boot-done"));
        exitTimer = window.setTimeout(() => {
          if (!cancelled) setBoot({ ready: true, exiting: false, saver: false });
        }, 1050);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBoot((current) =>
          current.saver ? { ...current, saver: false, exiting: false } : current
        );
        return;
      }

      if (event.altKey && event.shiftKey && event.code === "KeyH") {
        event.preventDefault();
        setBoot((current) => ({
          ready: true,
          exiting: false,
          saver: !current.saver,
        }));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("app-booting", visible);
    return () => document.documentElement.classList.remove("app-booting");
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`startup-gate ${boot.saver ? "startup-gate-saver" : ""} ${
        boot.exiting ? "startup-gate-exit" : ""
      }`}
      role={boot.saver ? "dialog" : "status"}
      aria-live="polite"
      aria-label={boot.saver ? "Screensaver" : "Preparing the site"}
    >
      <span className="startup-blackout" aria-hidden="true" />

      <div className="startup-mark">
        <span className="startup-build startup-build-top" aria-hidden="true" />
        <span className="startup-build startup-build-right" aria-hidden="true" />
        <span className="startup-build startup-build-bottom" aria-hidden="true" />
        <span className="startup-build startup-build-left" aria-hidden="true" />
        <span className="startup-field" aria-hidden="true" />
        <div className="startup-logo">
          <BrandMark size="footer" />
        </div>
        <span className="startup-line" />
        <span className="startup-caption">
          {boot.saver
            ? "Screensaver mode · Press Esc to return"
            : "Amelia Island Native"}
        </span>
        {!boot.saver && (
          <span className="startup-progress" aria-hidden="true">
            <span className="startup-progress-fill" />
          </span>
        )}
      </div>
    </div>
  );
}
