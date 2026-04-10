/** Identifiant stable d’un compte (UUID). */
export type IdentifiantUtilisateur = string;

/** Enregistrement utilisateur côté persistance (jamais exposé tel quel au client). */
export interface UtilisateurStocke {
  id: IdentifiantUtilisateur;
  emailNormalise: string;
  hashMotDePasse: string;
  creeLeIso: string;
}

/** Représentation publique renvoyée après inscription ou dans le profil minimal du JWT. */
export interface UtilisateurPublic {
  id: IdentifiantUtilisateur;
  email: string;
}
