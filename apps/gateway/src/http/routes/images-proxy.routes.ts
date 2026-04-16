import { Hono } from "hono";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import { forwardRequestToContainerEngine } from "../proxy/container-engine-proxy.js";
import type { VariablesGateway } from "../types/gateway-variables.js";

/**
 * Relaie `GET /images` vers le container-engine après authentification JWT,
 * sans logique Docker côté passerelle.
 */
export function monterRouteProxyImages(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
): void {
  const images = new Hono<{ Variables: VariablesGateway }>();
  images.use("*", creerMiddlewareAuthObligatoire(secretJwt));
  images.get("/", async (c) => forwardRequestToContainerEngine(c));
  app.route("/images", images);
}
