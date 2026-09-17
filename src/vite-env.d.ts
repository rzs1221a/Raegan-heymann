/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Map Tiles API key for Photorealistic 3D Tiles (optional). */
  readonly VITE_GOOGLE_3D_TILES_KEY?: string;
  /** "true" → listings come from the Repliers proxy function. */
  readonly VITE_USE_LIVE_LISTINGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
