import type { Context, MiddlewareHandler, Next } from "hono";
import type { VariablesHttpWeb } from "../types/variables-http-web.js";

const EN_TETE_UTILISATEUR = "x-kidopanel-utilisateur-id";
const EN_TETE_ROLE = "x-kidopanel-role-utilisateur";

/** Exige les en-têtes internes posés par la passerelle après vérification du jeton. */
export function creerMiddlewareIdentiteInterneObligatoire(): MiddlewareHandler<{
  Variables: VariablesHttpWeb;
}> {
  return async (c: Context<{ Variables: VariablesHttpWeb }>, next: Next) => {
    const uid = c.req.header(EN_TETE_UTILISATEUR)?.trim();
    const roleBrut = c.req.header(EN_TETE_ROLE)?.trim().toUpperCase();
    if (!uid) {
      return c.json(
        {
          error: {
            code: "IDENTITE_INTERNE_MANQUANTE",
            message:
              "Ce service doit être appelé via la passerelle (identité interne absente).",
          },
        },
        401,
      );
    }
    let role: "ADMIN" | "USER" | "VIEWER" = "USER";
    if (roleBrut === "ADMIN" || roleBrut === "USER" || roleBrut === "VIEWER") {
      role = roleBrut;
    }
    c.set("utilisateurIdInterne", uid);
    c.set("roleUtilisateurInterne", role);
    await next();
  };
}
