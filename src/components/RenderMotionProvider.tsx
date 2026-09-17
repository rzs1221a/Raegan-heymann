import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  getRenderMotionSnapshot,
  initRenderMotionEngine,
  setRenderMotionIntent,
  subscribeRenderMotion,
} from "../lib/renderMotion";

export default function RenderMotionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState(getRenderMotionSnapshot);
  const showHud =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("motionHud") === "1";

  useEffect(() => {
    const cleanup = initRenderMotionEngine();
    return () => {
      cleanup();
      delete document.documentElement.dataset.renderEngine;
      delete document.documentElement.dataset.renderLoad;
      delete document.documentElement.dataset.renderIntent;
    };
  }, []);

  useEffect(() => {
    setRenderMotionIntent("route", 760);
  }, [location.pathname]);

  useEffect(() => subscribeRenderMotion(setSnapshot), []);

  return (
    <>
      {children}
      {showHud && (
        <aside className="render-motion-hud" aria-label="Render motion diagnostics">
          <span>RM</span>
          <strong>{snapshot.fps}fps</strong>
          <span>{snapshot.load}</span>
          <span>{snapshot.intent}</span>
          <span>{snapshot.longFrames} long</span>
        </aside>
      )}
    </>
  );
}
