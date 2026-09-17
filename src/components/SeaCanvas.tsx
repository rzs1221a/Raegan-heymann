import { useEffect, useRef, useState, type ReactNode } from "react";
import { context, drawQuad, program } from "../gl/program";
import { SEA_FRAG } from "../gl/seaShader";
import * as ticker from "../gl/ticker";
import * as tier from "../gl/tier";
import { subscribeRenderMotion } from "../lib/renderMotion";

type Quality = { dpr: number; px: number; refines: number; octaves: number };

/**
 * The Atlantic, as a full-bleed band. A hand-written GLSL ocean under a dusk
 * sky, with the whole degradation apparatus from LiveLoveAmelia: two quality
 * profiles, a demote-only governor that sheds pixels before it sheds the
 * ocean, half-rate on high-Hz panels, off-screen pause, context-loss
 * recovery, and a CSS gradient fallback for reduced motion / no WebGL / a
 * shader that fails to compile. Only one instance mounts at a time.
 */
export default function SeaCanvas({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(() => tier.get() === 0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || tier.get() === 0) {
      setFallback(true);
      return;
    }
    const ctx = context(c);
    if (!ctx) {
      setFallback(true);
      return;
    }
    let { gl } = ctx;
    let prog = program(gl, SEA_FRAG, undefined, "sea");
    if (!prog) {
      setFallback(true);
      return;
    }
    prog.use();

    let vis = true;
    let lost = false;
    let stopped = false;

    const phone = tier.get() === 1;
    const q: Quality = phone
      ? { dpr: 1.0, px: 550_000, refines: 3, octaves: 5 }
      : { dpr: 1.5, px: 1_200_000, refines: 5, octaves: 7 };

    let pending = 0;
    function size() {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        q.dpr,
        1600 / Math.max(c!.clientWidth, 1),
        Math.sqrt(q.px / Math.max(c!.clientWidth * c!.clientHeight, 1))
      );
      const w = Math.max(1, Math.round(c!.clientWidth * dpr));
      const h = Math.max(1, Math.round(c!.clientHeight * dpr));
      if (c!.width === w && c!.height === h) return;
      c!.width = w;
      c!.height = h;
      gl.viewport(0, 0, w, h);
    }
    const resize = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(size);
    };
    size();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const io = new IntersectionObserver((es) =>
      es.forEach((e) => {
        vis = e.isIntersecting;
        if (vis && !stopped && !lost) ticker.add(draw);
        else ticker.remove(draw);
      })
    );
    io.observe(c);

    ctx.onLost(() => {
      lost = true;
      ticker.remove(draw);
    });
    ctx.onRestored(() => {
      gl = ctx.gl;
      prog = program(gl, SEA_FRAG, undefined, "sea");
      if (!prog) {
        setFallback(true);
        return;
      }
      prog.use();
      size();
      lost = false;
      if (vis && !stopped) ticker.add(draw);
    });

    // If frames run long, shed pixels before shedding the ocean: a fifth
    // fewer each step, down to a floor, never back up.
    let ema = 0;
    let bad = 0;
    function pace(dt: number) {
      const budget = (1000 / ticker.refreshHz()) * 1.6;
      ema = ema ? ema * 0.9 + dt * 0.1 : dt;
      if (ema > budget) {
        if (++bad >= 60 && q.px > 260_000) {
          q.px = Math.max(260_000, q.px * 0.8);
          bad = 0;
          ema = 0;
          size();
        }
      } else bad = Math.max(0, bad - 2);
      tier.sample(dt);
    }

    let frameNo = 0;
    function draw(now: number, dt: number) {
      if (!vis || lost || stopped || !prog) return;
      // Every frame at 60Hz; every other frame at 120Hz and up.
      if (ticker.refreshHz() >= 100 && ++frameNo & 1) return;
      pace(dt);
      prog.use();
      gl.uniform2f(prog.u("resolution"), c!.width, c!.height);
      gl.uniform1f(prog.u("time"), now);
      gl.uniform1f(prog.u("octaves"), q.octaves);
      gl.uniform1f(prog.u("refines"), q.refines);
      drawQuad(gl, prog);
    }
    ticker.add(draw);

    // Stop drawing but leave the last frame: the ocean vanishing mid-session
    // is a louder failure than the frame rate the governor protects.
    const offTier = tier.onChange((t) => {
      if (t === 0) {
        stopped = true;
        ticker.remove(draw);
      }
    });
    // The page-wide render governor: under "austere", hold the frame too.
    const offRender = subscribeRenderMotion((snap) => {
      if (snap.load === "austere" && !stopped) {
        stopped = true;
        ticker.remove(draw);
      }
    });

    return () => {
      ticker.remove(draw);
      ro.disconnect();
      io.disconnect();
      offTier();
      offRender();
      cancelAnimationFrame(pending);
      ctx.dispose();
    };
  }, []);

  return (
    <div className={`sea relative overflow-hidden ${className}`}>
      {!fallback && <canvas ref={canvasRef} className="sea-canvas" aria-hidden="true" />}
      <div className={`sea-fallback ${fallback ? "is-on" : ""}`} aria-hidden="true" />
      <div className="sea-grade" aria-hidden="true" />
      {children}
    </div>
  );
}
