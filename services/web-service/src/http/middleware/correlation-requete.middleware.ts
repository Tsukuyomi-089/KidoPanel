import type { MiddlewareHandler } from "hono";
import { randomUUID } from "node:crypto";
import type { VariablesHttpWeb } from "../types/variables-http-web.js";

const EN_TETE_ID = "x-request-id";

/** Attache un identifiant unique à la requête pour les journaux et relais vers le moteur. */
export const middlewareCorrelationRequeteWeb: MiddlewareHandler<{
  Variables: VariablesHttpWeb;
}> = async (c, next) => {
  const entrant = c.req.header(EN_TETE_ID)?.trim();
  const id = entrant !== undefined && entrant.length > 0 ? entrant : randomUUID();
  c.set("requestId", id);
  await next();
};
