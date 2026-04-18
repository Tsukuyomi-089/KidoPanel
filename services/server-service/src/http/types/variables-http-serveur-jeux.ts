/** Variables Hono pour la corrélation et l’identité injectée par la passerelle interne. */
export type VariablesServeurJeux = {
  requestId: string;
  utilisateurIdInterne?: string;
  roleUtilisateurInterne?: "ADMIN" | "USER" | "VIEWER";
};
