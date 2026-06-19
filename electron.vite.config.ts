import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "electron-vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main/index.ts"),
        },
        // electron-vite 6 defaults to ESM output; this project's package.json
        // "main" and preload reference expect CommonJS (.cjs), so force it.
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs",
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
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs",
        },
      },
    },
  },
  renderer: {
    // Restore pre-Vite-8 CJS default-import interop (see vite.config.ts).
    legacy: {
      inconsistentCjsInterop: true,
    },
    resolve: {
      // Share the app's single React 19; see vite.config.ts.
      dedupe: ["react", "react-dom"],
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
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        workbox: { maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 },
      }),
    ],
  },
});
