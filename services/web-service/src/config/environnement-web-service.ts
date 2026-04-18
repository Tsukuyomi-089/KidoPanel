/**
 * Lecture des variables d’environnement du service instances web (port d’écoute, URL du moteur).
 */

const PORT_DEFAUT = 8791;
const HOTE_DEFAUT = "0.0.0.0";
const MOTEUR_DEFAUT = "http://127.0.0.1:8787";
const NOM_CONTENEUR_PROXY_DEFAUT = "kidopanel-proxy";
const CHEMIN_CONF_NGINX_DEFAUT = "/etc/nginx/conf.d/kidopanel-proxy-generated.conf";

/** Port HTTP du service (WEB_SERVICE_PORT). */
export function obtenirPortEcouteWebService(): number {
  const brut = process.env.WEB_SERVICE_PORT ?? process.env.PORT;
  const n = Number(brut ?? String(PORT_DEFAUT));
  return Number.isFinite(n) && n > 0 ? n : PORT_DEFAUT;
}

/** Adresse d’écoute du serveur HTTP (WEB_SERVICE_LISTEN_HOST). */
export function obtenirAdresseEcouteWebService(): string {
  const brut = process.env.WEB_SERVICE_LISTEN_HOST?.trim();
  return brut !== undefined && brut.length > 0 ? brut : HOTE_DEFAUT;
}

/** URL de base du container-engine (CONTAINER_ENGINE_BASE_URL). */
export function obtenirUrlBaseMoteurConteneurs(): string {
  const brut = process.env.CONTAINER_ENGINE_BASE_URL?.trim();
  const base = brut !== undefined && brut.length > 0 ? brut : MOTEUR_DEFAUT;
  return base.replace(/\/+$/, "");
}

/** Nom Docker attendu pour le conteneur Nginx frontal partagé. */
export function obtenirNomConteneurProxyNginx(): string {
  const brut = process.env.KIDOPANEL_PROXY_CONTAINER_NAME?.trim();
  return brut !== undefined && brut.length > 0 ? brut : NOM_CONTENEUR_PROXY_DEFAUT;
}

/** Chemin absolu du fichier de configuration regénéré dans le conteneur proxy. */
export function obtenirCheminConfGenereeDansProxy(): string {
  const brut = process.env.KIDOPANEL_PROXY_NGINX_CONF_PATH?.trim();
  return brut !== undefined && brut.length > 0 ? brut : CHEMIN_CONF_NGINX_DEFAUT;
}
