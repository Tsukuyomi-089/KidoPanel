import { Hono } from "hono";
import { construireReponseListeCatalogueImages } from "@kidopanel/container-catalog";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import type { VariablesGateway } from "../types/gateway-variables.js";

/**
 * Expose `GET /images` : liste figée du catalogue autorisé (aucun appel au container-engine ni à Docker).
 */
export function monterRouteCatalogueImagesPasserelle(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
): void {
  const groupe = new Hono<{ Variables: VariablesGateway }>();
  groupe.use("*", creerMiddlewareAuthObligatoire(secretJwt));
  groupe.get("/", (c) => c.json(construireReponseListeCatalogueImages()));
  app.route("/images", groupe);
}
