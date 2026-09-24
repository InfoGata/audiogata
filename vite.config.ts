import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { buildInfoDefine } from "./build-info";

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 8 switched to Rolldown and made CJS default-import interop "consistent"
  // (default = full module.exports), which breaks CJS deps that use the
  // `exports.default` + `__esModule` pattern without an ESM build (e.g.
  // redux-persist, react-outside-call). Restore the pre-Vite-8 behavior.
  legacy: {
    inconsistentCjsInterop: true,
  },
  // Version and commit, so a bug report can name the build it came from.
  define: buildInfoDefine(),
  resolve: {
    // react-outside-call declares react/react-dom as regular deps (not peers),
    // so a nested React 18 gets installed. Vite 8's Rolldown optimizer would
    // otherwise bundle that duplicate, producing "A React Element from an older
    // version of React" at runtime. Force a single React across all deps.
    dedupe: ["react", "react-dom"],
    alias: {
      "hls.js": "hls.js/dist/hls.min.js",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "src/test/before.ts"],
    teardownTimeout: 5000,
  },
  plugins: [
    tailwindcss(),
    // Each route becomes its own chunk, so opening the app parses the shell and
    // the route being visited rather than every route. The service worker still
    // precaches every chunk, so this changes when code is parsed rather than how
    // much is eventually downloaded.
    //
    // Must come before the react plugin: it rewrites route files and has to see
    // them before JSX is transformed. The build fails loudly if reordered.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    VitePWA({
      // "autoUpdate" bakes skipWaiting/clientsClaim into the generated sw.js, so a
      // client stuck on a stale precached index.html recovers on its own. Under
      // "prompt" the only way to activate a waiting worker was for the page to post
      // SKIP_WAITING — impossible when the stale build is what failed to boot.
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        navigateFallback: "/index.html",
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
  // Each app in ~/projects/webapps owns a unique port so they can all run at
  // once; strictPort makes a collision fail loudly instead of silently drifting
  // to the next free port (which would break the pinned OAuth/CSP origins).
  server: {
    port: 3001,
    strictPort: true,
    // Listen on IPv4 loopback so OAuth providers that reject "localhost"
    // redirect URIs (Spotify) can use http://127.0.0.1:3001 instead. Browsers
    // still reach localhost and *.localhost by falling back to IPv4.
    host: "127.0.0.1",
    // The app itself must stay on localhost: plugin iframes live on
    // <pluginId>.localhost, and an IP address can't have subdomains.
    open: "http://localhost:3001/",
  },
  preview: {
    port: 4001,
    strictPort: true,
  },
});
