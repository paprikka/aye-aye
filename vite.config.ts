import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        preview: "preview.html",
        background: "src/background.ts",
        content: "src/content.ts",
      },

      output: {
        amd: { id: "ayeaye-link-grabber" },
        dir: "dist",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  optimizeDeps: {
    include: ["preact", "preact/hooks"],
  },
});
