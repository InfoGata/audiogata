/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "hls.js": "hls.js/dist/hls.min.js",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto"],
  },
  plugins: [
    react(),
    svgrPlugin(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        short_name: "AudioGata",
        name: "AudioGata",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "logo192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
