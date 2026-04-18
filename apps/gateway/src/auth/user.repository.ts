import type { UtilisateurPublic, UtilisateurStocke } from "./user.types.js";

/** Projette un enregistrement stocké vers la forme exposée au client (sans hash). */
export function versUtilisateurPublic(u: UtilisateurStocke): UtilisateurPublic {
  return { id: u.id, email: u.emailNormalise, role: u.role };
}
