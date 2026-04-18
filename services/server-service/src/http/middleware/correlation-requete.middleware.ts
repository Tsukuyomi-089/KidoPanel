import { randomUUID } from "node:crypto";
import type { Context, Next } from "hono";
import type { VariablesServeurJeux } from "../types/variables-http-serveur-jeux.js";
import {
  incrementerErreursServeurJeux,
  incrementerRequetesServeurJeux,
} from "../../observabilite/metriques-serveur-jeux.js";

/** Attribue un identifiant de corrélation par requête pour les journaux et l’appel au moteur Docker. */
export async function middlewareCorrelationServeurJeux(
  c: Context<{ Variables: VariablesServeurJeux }>,
  next: Next,
): Promise<void> {
  const requestId = randomUUID();
  c.set("requestId", requestId);
  const debut = performance.now();
  await next();
  const dureeMs = Math.round(performance.now() - debut);
  const statut = c.res.status;
  incrementerRequetesServeurJeux();
  if (statut >= 500) {
    incrementerErreursServeurJeux();
  }
  c.header("X-Request-Id", requestId);
  if (process.env.NODE_ENV !== "production") {
    c.header("X-Kidopanel-Temps-Ms", String(dureeMs));
  }
}
