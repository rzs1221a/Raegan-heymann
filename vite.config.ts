import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // deck.gl / loaders.gl are NOT listed here on purpose: they are reached
    // only through the dynamic import in src/lib/photoreal.ts, so the bundler
    // splits them into async chunks that never load without a Google key.
    // Naming them as a manual chunk made the bundler hoist Vite's shared
    // preload helper into that chunk, which the entry then imported eagerly.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/maplibre-gl")) return "maplibre";
          if (id.includes("node_modules/gsap")) return "motion";
          if (id.includes("/src/data/")) return "app-data";
        },
      },
    },
  },
});
