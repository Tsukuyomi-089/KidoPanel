import type { Hono } from "hono";
import { construireReponseListeCatalogueImages } from "@kidopanel/container-catalog";
import type { VariablesMoteurHttp } from "../variables-moteur-http.js";

/**
 * Expose `GET /images` : uniquement le catalogue d’images autorisées (aucune inspection Docker).
 */
export function mountImagesRoutes(
  app: Hono<{ Variables: VariablesMoteurHttp }>,
): void {
  app.get("/images", (c) => c.json(construireReponseListeCatalogueImages()));
}
