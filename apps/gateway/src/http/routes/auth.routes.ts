import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  corpsConnexionSchema,
  corpsInscriptionSchema,
} from "../../auth/auth.schemas.js";
import type { ServiceAuth } from "../../auth/auth.service.js";

/**
 * Routes publiques d’inscription et de connexion ; émettent un JWT après succès.
 */
export function monterRoutesAuth(app: Hono, serviceAuth: ServiceAuth): void {
  const auth = new Hono();

  auth.post(
    "/register",
    zValidator("json", corpsInscriptionSchema),
    async (c) => {
      const { email, password } = c.req.valid("json");
      try {
        const { jeton, utilisateur } = await serviceAuth.inscrire(email, password);
        return c.json(
          {
            token: jeton,
            user: { id: utilisateur.id, email: utilisateur.email },
          },
          201,
        );
      } catch (erreur) {
        if (
          erreur instanceof Error &&
          erreur.message === "EMAIL_DEJA_UTILISE"
        ) {
          return c.json(
            {
              error: {
                code: "EMAIL_ALREADY_REGISTERED",
                message: "Un compte existe déjà avec cette adresse e-mail.",
              },
            },
            409,
          );
        }
        throw erreur;
      }
    },
  );

  auth.post("/login", zValidator("json", corpsConnexionSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    try {
      const { jeton, utilisateur } = await serviceAuth.connecter(email, password);
      return c.json({
        token: jeton,
        user: { id: utilisateur.id, email: utilisateur.email },
      });
    } catch (erreur) {
      if (
        erreur instanceof Error &&
        erreur.message === "IDENTIFIANTS_INVALIDES"
      ) {
        return c.json(
          {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Adresse e-mail ou mot de passe incorrect.",
            },
          },
          401,
        );
      }
      throw erreur;
    }
  });

  app.route("/auth", auth);
}
