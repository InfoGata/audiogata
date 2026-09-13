/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

/** Injected by build-info.ts through the `define` in both vite configs. */
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;


interface ImportMetaEnv {
  readonly VITE_PUBLIC_POSTHOG_KEY: string;
  readonly VITE_PUBLIC_POSTHOG_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}