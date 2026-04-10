import type { UtilisateurPublic } from "../../auth/user.types.js";

/** Variables Hono communes : corrélation sur toute la passerelle. */
export type VariablesGateway = {
  requestId: string;
  utilisateur?: UtilisateurPublic;
};

/** Alias pour les routes sous /containers après le middleware JWT (utilisateur toujours défini côté métier). */
export type VariablesPasserelle = VariablesGateway & {
  utilisateur: UtilisateurPublic;
};
