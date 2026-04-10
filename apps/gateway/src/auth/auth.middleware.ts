import type { Context, MiddlewareHandler, Next } from "hono";
import { jwtVerify } from "jose";
import type { VariablesPasserelle } from "../http/types/gateway-variables.js";

/**
 * Exige un JWT HS256 valide (émis par la passerelle) et enrichit le contexte avec l’utilisateur courant.
 */
export function creerMiddlewareAuthObligatoire(
  secretJwt: Uint8Array,
): MiddlewareHandler<{ Variables: VariablesPasserelle }> {
  return async (c: Context<{ Variables: VariablesPasserelle }>, next: Next) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentification requise : en-tête Authorization Bearer manquant.",
          },
        },
        401,
      );
    }

    const jeton = auth.slice("Bearer ".length).trim();
    if (!jeton) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Jeton d’accès vide.",
          },
        },
        401,
      );
    }

    try {
      const { payload } = await jwtVerify(jeton, secretJwt);
      const sub = payload.sub;
      const email =
        typeof payload.email === "string" ? payload.email : undefined;
      if (!sub || !email) {
        return c.json(
          {
            error: {
              code: "UNAUTHORIZED",
              message: "Jeton d’accès incomplet (sub ou email).",
            },
          },
          401,
        );
      }
      c.set("utilisateur", { id: sub, email });
    } catch {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Jeton d’accès invalide ou expiré.",
          },
        },
        401,
      );
    }

    await next();
  };
}
