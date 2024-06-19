import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "electron-vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main/index.ts"),
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload/index.ts"),
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "hls.js": "hls.js/dist/hls.min.js",
        "@": path.resolve(__dirname, "./src"),
      },
    },
    root: ".",
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html"),
        },
      },
    },
    plugins: [react(), VitePWA()],
  },
});
