/**
 * WebGL plumbing: context acquisition, shader compilation that actually
 * reports failure, and the fullscreen quad. A broken shader returns null so
 * the caller can fall back to CSS instead of leaving a black rectangle.
 * Ported from LiveLoveAmelia's gl/program.js.
 */
import { precision, VERT } from "./glsl";

export const stats = { contexts: 0, programs: 0, errors: [] as string[] };

const CTX_OPTS: WebGLContextAttributes = {
  alpha: false,
  depth: false,
  stencil: false,
  antialias: false,
  preserveDrawingBuffer: false,
  premultipliedAlpha: false,
  powerPreference: "high-performance",
};

export interface GlContext {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  onLost: (fn: () => void) => void;
  onRestored: (fn: () => void) => void;
  dispose: () => void;
}

export function context(
  canvas: HTMLCanvasElement,
  opts: WebGLContextAttributes = {}
): GlContext | null {
  const o = { ...CTX_OPTS, ...opts };
  let gl: WebGLRenderingContext | null;
  try {
    gl =
      (canvas.getContext("webgl", o) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl", o) as WebGLRenderingContext | null);
  } catch {
    return null;
  }
  if (!gl) return null;
  stats.contexts++;
  const handlers = { lost: [] as (() => void)[], restored: [] as (() => void)[] };
  canvas.addEventListener("webglcontextlost", (e) => {
    // Without preventDefault the context never comes back.
    e.preventDefault();
    handlers.lost.forEach((f) => {
      try {
        f();
      } catch {
        /* ignore */
      }
    });
  });
  canvas.addEventListener("webglcontextrestored", () => {
    handlers.restored.forEach((f) => {
      try {
        f();
      } catch {
        /* ignore */
      }
    });
  });
  const ctx: GlContext = {
    gl,
    canvas,
    onLost: (f) => handlers.lost.push(f),
    onRestored: (f) => handlers.restored.push(f),
    dispose() {
      try {
        ctx.gl.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        /* ignore */
      }
      stats.contexts--;
    },
  };
  return ctx;
}

export interface GlProgram {
  handle: WebGLProgram;
  use: () => void;
  quadAttrib: () => number;
  u: (name: string) => WebGLUniformLocation | null;
}

export function program(
  gl: WebGLRenderingContext,
  frag: string,
  vert: string = VERT,
  label = "shader"
): GlProgram | null {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || "unknown";
      stats.errors.push(`${label}: ${log}`);
      console.error(`[gl] ${label} failed to compile:`, log);
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vs = make(gl.VERTEX_SHADER, vert);
  const fs = make(gl.FRAGMENT_SHADER, precision(gl) + "\n" + frag);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const pr = gl.createProgram();
  if (!pr) return null;
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(pr) || "unknown";
    stats.errors.push(`${label}: ${log}`);
    console.error(`[gl] ${label} failed to link:`, log);
    gl.deleteProgram(pr);
    return null;
  }
  stats.programs++;
  const cache = new Map<string, WebGLUniformLocation | null>();
  let attrib = -2;
  return {
    handle: pr,
    use() {
      gl.useProgram(pr);
    },
    quadAttrib() {
      if (attrib === -2) attrib = gl.getAttribLocation(pr, "p");
      return attrib;
    },
    u(name) {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(pr, name));
      return cache.get(name) ?? null;
    },
  };
}

const quads = new WeakMap<WebGLRenderingContext, WebGLBuffer>();
function quad(gl: WebGLRenderingContext) {
  let b = quads.get(gl);
  if (!b) {
    b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    quads.set(gl, b);
  }
  return b;
}

export function drawQuad(gl: WebGLRenderingContext, prog: GlProgram) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quad(gl));
  const loc = prog.quadAttrib();
  if (loc < 0) return;
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
