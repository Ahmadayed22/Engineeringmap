/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin. Empty string = same origin as the page. Unset = production Render URL. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
