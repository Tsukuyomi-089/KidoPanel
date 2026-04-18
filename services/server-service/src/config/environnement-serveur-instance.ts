/**
 * URL de base du container-engine (sans barre finale) pour les appels HTTP de pilotage des conteneurs.
 */
export function obtenirUrlBaseMoteurConteneurs(): string {
  const brut = process.env.CONTAINER_ENGINE_BASE_URL?.trim();
  const defaut = "http://127.0.0.1:8787";
  if (!brut) {
    return defaut;
  }
  return brut.replace(/\/+$/, "");
}

/** Port d’écoute HTTP du service instances jeu. */
export function obtenirPortEcouteServeurJeux(): number {
  const p = Number(process.env.SERVER_SERVICE_PORT ?? process.env.PORT ?? 8790);
  return Number.isFinite(p) && p >= 1 && p <= 65_535 ? p : 8790;
}

/** Adresse d’écoute : localhost par défaut (appelée par la passerelle sur la même machine). */
export function obtenirAdresseEcouteServeurJeux(): string {
  return process.env.SERVER_SERVICE_LISTEN_HOST?.trim() || "127.0.0.1";
}
