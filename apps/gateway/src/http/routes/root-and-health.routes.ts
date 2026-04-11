import type { Hono } from "hono";
import type { VariablesGateway } from "../types/gateway-variables.js";
import { forwardRequestToContainerEngine } from "../proxy/container-engine-proxy.js";

/**
 * Route racine (identité de la passerelle) et santé relayée vers le moteur de conteneurs.
 */
export function monterRoutesRacineEtSante(
  app: Hono<{ Variables: VariablesGateway }>,
): void {
  app.get("/", (c) =>
    c.json({
      service: "gateway",
      description:
        "Point d’entrée HTTP unique pour le panel ; relais vers les services métier sans accès Docker.",
    }),
  );

  /**
   * Santé de la passerelle seule (sans appel au container-engine) : distingue « passerelle
   * injoignable » et « moteur Docker injoignable » lorsque GET /health renvoie 502.
   */
  app.get("/health/gateway", (c) =>
    c.json({
      service: "gateway",
      status: "ok",
    }),
  );

  app.get("/health", (c) => forwardRequestToContainerEngine(c));
}
