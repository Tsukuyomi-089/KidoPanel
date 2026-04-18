import {
  construireCorpsCreationDefautDepuisGabaritDockerRapide,
  listeGabaritsDockerRapide,
} from "@kidopanel/container-catalog";
import { Hono } from "hono";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import type { VariablesGateway } from "../types/gateway-variables.js";

/** Projette la catégorie métier du catalogue vers le libellé attendu par les clients historiques du rail templates. */
function categorieVersLibelleApi(
  categorie: "web" | "base-de-donnees" | "runtime" | "cache",
): string {
  if (categorie === "base-de-donnees") {
    return "db";
  }
  return categorie;
}

/**
 * Route `GET /templates` : liste des gabarits Docker rapides depuis le package catalogue (sans appel au moteur Docker).
 */
export function monterRouteTemplatesCataloguePasserelle(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
): void {
  const groupe = new Hono<{ Variables: VariablesGateway }>();
  groupe.use("*", creerMiddlewareAuthObligatoire(secretJwt));
  groupe.get("/", (c) =>
    c.json({
      templates: listeGabaritsDockerRapide().map((t) => ({
        id: t.id,
        name: t.nom,
        description: t.description,
        imageCatalogId: t.imageCatalogId,
        defaultConfig: construireCorpsCreationDefautDepuisGabaritDockerRapide(t),
        category: categorieVersLibelleApi(t.categorie),
      })),
    }),
  );
  app.route("/templates", groupe);
}
