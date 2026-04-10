import { Hono } from "hono";
import type { DepotProprieteConteneur } from "../../auth/container-ownership.repository.js";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import type { VariablesPasserelle } from "../types/gateway-variables.js";
import { proxyConteneursAvecPropriete } from "../services/proxy-conteneurs-authentifie.service.js";

/**
 * Proxy REST des conteneurs vers le container-engine, protégé par JWT et cloisonné par utilisateur.
 */
export function monterRoutesProxyConteneurs(
  app: Hono,
  secretJwt: Uint8Array,
  depotPropriete: DepotProprieteConteneur,
): void {
  const conteneurs = new Hono<{ Variables: VariablesPasserelle }>();
  conteneurs.use("*", creerMiddlewareAuthObligatoire(secretJwt));

  const relayer = (c: Parameters<typeof proxyConteneursAvecPropriete>[0]) =>
    proxyConteneursAvecPropriete(c, c.get("utilisateur"), depotPropriete);

  conteneurs.get("/", relayer);
  conteneurs.post("/", relayer);
  conteneurs.post("/:id/start", relayer);
  conteneurs.post("/:id/stop", relayer);
  conteneurs.delete("/:id", relayer);
  conteneurs.get("/:id/logs", relayer);

  app.route("/containers", conteneurs);
}
