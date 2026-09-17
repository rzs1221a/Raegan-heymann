/** Shared GLSL for the fullscreen-quad shaders. */
export const VERT = `attribute vec2 p;varying vec2 uv;void main(){uv=p*0.5+0.5;gl_Position=vec4(p,0.,1.);}`;

/** WebGL1 does not guarantee highp in fragment shaders; ask before claiming it. */
export function precision(gl: WebGLRenderingContext): string {
  const f = gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return f && f.precision > 0 ? "precision highp float;" : "precision mediump float;";
}
