import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";

/**
 * Autorise le panel Vite (port ou hôte différent) à appeler la passerelle depuis le navigateur.
 * Sans réponse CORS adaptée, les `fetch` cross-origin échouent côté client (« Failed to fetch »).
 */
export function creerMiddlewareCorsPanel(): MiddlewareHandler {
  return cors({
    origin: (origine) => origine ?? "*",
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    allowMethods: [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    exposeHeaders: ["X-Request-Id"],
    maxAge: 86_400,
  });
}
