import { Hono } from "hono";
import { listeTemplates } from "@kidopanel/container-catalog";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import type { VariablesGateway } from "../types/gateway-variables.js";

/**
 * Route `GET /templates` : liste des gabarits d’instance depuis le package catalogue (sans appel au moteur Docker).
 */
export function monterRouteTemplatesCataloguePasserelle(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
): void {
  const groupe = new Hono<{ Variables: VariablesGateway }>();
  groupe.use("*", creerMiddlewareAuthObligatoire(secretJwt));
  groupe.get("/", (c) =>
    c.json({
      templates: listeTemplates().map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        imageCatalogId: t.imageCatalogId,
        defaultConfig: t.defaultConfig,
        category: t.category,
      })),
    }),
  );
  app.route("/templates", groupe);
}
