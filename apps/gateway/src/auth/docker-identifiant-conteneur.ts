const LONGUEUR_PREFIXE_DOCKER = 12;

/** Préfixe normalisé (12 caractères) comparable aux identifiants courts ou longs renvoyés par Docker. */
export function prefixeDocker(id: string): string {
  const nettoye = id.trim().toLowerCase();
  return nettoye.slice(0, LONGUEUR_PREFIXE_DOCKER);
}

/** Deux identifiants désignent le même conteneur si leurs préfixes Docker coïncident. */
export function memeConteneur(idA: string, idB: string): boolean {
  return prefixeDocker(idA) === prefixeDocker(idB);
}

/**
 * Détermine si l’identifiant Docker cible correspond à l’un des conteneurs enregistrés pour l’utilisateur.
 */
export function estConteneurPossede(
  idsPossedes: readonly string[],
  idConteneurDocker: string,
): boolean {
  for (const idStocke of idsPossedes) {
    if (memeConteneur(idStocke, idConteneurDocker)) {
      return true;
    }
  }
  return false;
}
