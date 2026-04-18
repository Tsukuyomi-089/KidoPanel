/** Variables Hono : identité interne et corrélation HTTP. */
export type VariablesHttpWeb = {
  requestId: string;
  utilisateurIdInterne?: string;
  roleUtilisateurInterne?: "ADMIN" | "USER" | "VIEWER";
};
