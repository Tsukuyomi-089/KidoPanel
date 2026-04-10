import { randomUUID } from "node:crypto";
import type { Context, Next } from "hono";
import { journaliserMoteur } from "../../observabilite/journal-json.js";
import {
  incrementerErreursMoteur,
  incrementerRequetesMoteur,
  lireMetriquesMoteur,
} from "../../observabilite/metriques-moteur.js";
import { EN_TETE_ID_REQUETE_INTERNE } from "../constantes-correlation-http.js";
import type { VariablesMoteurHttp } from "../variables-moteur-http.js";

/**
 * Reprend l’identifiant fourni par la passerelle ou en crée un si appel direct, journalise la requête terminée
 * et met à jour les compteurs (requêtes, erreurs HTTP ≥ 500).
 */
export async function middlewareCorrelationRequeteMoteur(
  c: Context<{ Variables: VariablesMoteurHttp }>,
  next: Next,
): Promise<void> {
  const entrant = c.req.header(EN_TETE_ID_REQUETE_INTERNE)?.trim();
  const requestId =
    entrant !== undefined && entrant.length > 0 ? entrant : randomUUID();
  c.set("requestId", requestId);

  const debut = performance.now();
  await next();
  const dureeMs = Math.round(performance.now() - debut);
  const statut = c.res.status;

  incrementerRequetesMoteur();
  if (statut >= 500) {
    incrementerErreursMoteur();
  }

  c.header(EN_TETE_ID_REQUETE_INTERNE, requestId);

  journaliserMoteur({
    niveau: "info",
    message: "requete_http_terminee",
    requestId,
    metadata: {
      methode: c.req.method,
      chemin: c.req.path,
      statut,
      dureeMs,
    },
  });
}

/** Expose l’état des compteurs internes en JSON pour supervision légère. */
export function routeMetriquesMoteur(c: Context): Response {
  return c.json(lireMetriquesMoteur());
}
