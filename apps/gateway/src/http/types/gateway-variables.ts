import type { UtilisateurPublic } from "../../auth/user.types.js";

/** Variables Hono partagées sur les routes protégées par authentification. */
export type VariablesPasserelle = {
  utilisateur: UtilisateurPublic;
};
