/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de la passerelle (ex. http://127.0.0.1:3000), sans slash final. */
  readonly VITE_GATEWAY_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
