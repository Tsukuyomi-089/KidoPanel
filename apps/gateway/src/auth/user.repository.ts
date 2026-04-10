import type { UtilisateurPublic, UtilisateurStocke } from "./user.types.js";

/**
 * Contrat de persistance des comptes utilisateurs.
 * Implémentation mémoire aujourd’hui ; remplaçable par un adaptateur SQL sans changer la couche auth.
 */
export interface DepotUtilisateur {
  /** Crée un compte ; lève si l’email est déjà pris (comportement défini par l’implémentation). */
  creer(utilisateur: UtilisateurStocke): void;

  /** Recherche par email déjà normalisé (minuscules, trim). */
  trouverParEmail(emailNormalise: string): UtilisateurStocke | undefined;

  /** Recherche par identifiant interne. */
  trouverParId(id: string): UtilisateurStocke | undefined;

  /** Indique si l’email normalisé existe déjà. */
  emailExiste(emailNormalise: string): boolean;
}

/** Projette un enregistrement stocké vers la forme exposée au client (sans hash). */
export function versUtilisateurPublic(u: UtilisateurStocke): UtilisateurPublic {
  return { id: u.id, email: u.emailNormalise };
}
