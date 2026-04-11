/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de la passerelle (ex. http://127.0.0.1:3000), sans slash final. */
  readonly VITE_GATEWAY_BASE_URL?: string;
  /** En dev : `1` ou `true` pour forcer le proxy Vite `/__kidopanel_gateway` au lieu de l’hôte de la page :3000. */
  readonly VITE_GATEWAY_DEV_USE_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
