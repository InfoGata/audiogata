import { defineConfig } from "vite";

/**
 * Builds src/po-minter/page.ts on its own into public/po-minter.js: one
 * self-contained script that the desktop app's main process and the Android
 * plugin inject into their hidden minter page as plain source. Being in
 * public/ puts it in the renderer build (Electron) and the web assets the APK
 * carries (Android). Generated; see .gitignore.
 */
export default defineConfig({
  publicDir: false,
  build: {
    outDir: "public",
    emptyOutDir: false,
    lib: {
      entry: "src/po-minter/page.ts",
      formats: ["iife"],
      name: "InfoGataPoMinter",
      fileName: () => "po-minter.js",
    },
  },
});
