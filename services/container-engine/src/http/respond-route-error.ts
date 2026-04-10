import type { Context } from "hono";
import { isContainerEngineError } from "../errors.js";
import { journaliserMoteur } from "../observabilite/journal-json.js";
import { statusAndBodyForEngineError } from "./map-engine-error-to-http.js";
import type { VariablesMoteurHttp } from "./variables-moteur-http.js";

/**
 * Si l’erreur est une `ContainerEngineError`, journalise le détail serveur (code, piles)
 * puis renvoie la réponse HTTP sans exposer la trace au client ;
 * sinon retourne `null` pour laisser le gestionnaire global traiter l’exception.
 */
export function tryRespondWithEngineError(
  c: Context<{ Variables: VariablesMoteurHttp }>,
  err: unknown,
): Response | null {
  if (!isContainerEngineError(err)) {
    return null;
  }
  const meta: Record<string, unknown> = {
    code: err.code,
  };
  if (err.stack !== undefined) {
    meta.stack = err.stack;
  }
  if (err.cause instanceof Error && err.cause.stack !== undefined) {
    meta.stackCause = err.cause.stack;
  }
  journaliserMoteur({
    niveau: "error",
    message: "erreur_docker_ou_moteur",
    requestId: c.get("requestId"),
    metadata: meta,
  });
  const { status, body } = statusAndBodyForEngineError(err);
  return c.json(body, status);
}
