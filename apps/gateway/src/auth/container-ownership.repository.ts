/**
 * Associe les identifiants Docker aux propriétaires côté passerelle.
 * Le moteur de conteneurs reste agnostique ; cette couche impose le cloisonnement multi-locataire.
 */
export interface DepotProprieteConteneur {
  /** Enregistre la propriété après une création confirmée (identifiant complet renvoyé par Docker). */
  enregistrer(userId: string, idConteneurComplet: string): void;

  /** Vérifie la propriété en tolérant les identifiants courts ou longs renvoyés par l’API Docker. */
  estProprietaire(userId: string, idConteneurDocker: string): boolean;

  /** Supprime toute entrée correspondant au même conteneur (préfixe 12 caractères). */
  retirerPourIdentifiant(idConteneurDocker: string): void;
}
