import type { Hono } from "hono";
import { obtenirDiagnosticPareFeuHote } from "../../pare-feu/diagnostic-pare-feu-hote.js";
import type { VariablesMoteurHttp } from "../variables-moteur-http.js";

/**
 * Route en lecture seule : état du pare-feu hôte (firewalld / UFW) pour aide diagnostique côté panel.
 */
export function mountDiagnosticPareFeuRoutes(
  app: Hono<{ Variables: VariablesMoteurHttp }>,
): void {
  app.get("/diagnostic/pare-feu", async (c) => {
    const diag = await obtenirDiagnosticPareFeuHote();
    return c.json(diag);
  });
}
