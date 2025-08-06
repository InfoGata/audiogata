/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "hls.js": "hls.js/dist/hls.min.js",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "src/test/before.ts"],
    server: {
      deps: {
        inline: ["react-chatbotify"]
      },
    }
  },
  plugins: [
    react(),
    TanStackRouterVite({ target: "react" }),
    VitePWA({
      registerType: "prompt",
      workbox: {
        navigateFallback: "/",
        navigateFallbackDenylist: [
          /\.html$/,
          /\.html\?/,
          /login_popup\.html/,
        ],
      },
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
    open: true,
  },
});
