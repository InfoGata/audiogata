interface ImportMetaEnv {
  readonly VITE_DOMAIN: string;
  readonly VITE_UNSAFE_SAME_ORIGIN_IFRAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
