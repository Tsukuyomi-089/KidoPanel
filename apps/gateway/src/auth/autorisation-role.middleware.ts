import type { RoleUtilisateurKidoPanel } from "./user.types.js";

/** Indique si le rôle correspond à un opérateur pouvant contourner les contraintes utilisateur ordinaires. */
export function estRoleAdministrateur(role: RoleUtilisateurKidoPanel): boolean {
  return role === "ADMIN";
}

/** Indique si le rôle est limité à la lecture des ressources (pas de création ni de pilotage). */
export function estRoleLectureSeule(role: RoleUtilisateurKidoPanel): boolean {
  return role === "VIEWER";
}
