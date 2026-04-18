import type { ContainerOwnershipRepository } from "./container-ownership-repository.prisma.js";
import { estConteneurPossede } from "./docker-identifiant-conteneur.js";
import { estRoleAdministrateur } from "./autorisation-role.middleware.js";
import type { UtilisateurPublic } from "./user.types.js";

/**
 * Point d’entrée unique côté passerelle pour savoir si un utilisateur peut agir sur un conteneur donné (interrogation Prisma via le dépôt).
 */
export async function verifyContainerOwnership(
  depot: ContainerOwnershipRepository,
  userId: string,
  containerId: string,
): Promise<boolean> {
  return depot.userOwnsContainer(userId, containerId);
}

/**
 * Indique si l’utilisateur peut accéder au conteneur : administrateur global ou propriétaire enregistré.
 */
export async function verifierAccesUtilisateurAuConteneur(
  depot: ContainerOwnershipRepository,
  utilisateur: UtilisateurPublic,
  containerId: string,
): Promise<boolean> {
  if (estRoleAdministrateur(utilisateur.role)) {
    return true;
  }
  return verifyContainerOwnership(depot, utilisateur.id, containerId);
}

/**
 * Filtre la liste renvoyée par le moteur : ne conserve que les entrées dont l’identifiant correspond à une propriété enregistrée pour l’utilisateur (une requête liste côté dépôt, cohérente avec verifyContainerOwnership).
 */
export async function filtrerConteneursParProprieteUtilisateur<
  T extends { id: string },
>(
  depot: ContainerOwnershipRepository,
  userId: string,
  conteneurs: T[],
): Promise<T[]> {
  const idsPossedes = await depot.getContainerIdsByUser(userId);
  return conteneurs.filter((cont) =>
    estConteneurPossede(idsPossedes, cont.id),
  );
}

/**
 * Restreint la liste moteur aux conteneurs visibles par l’utilisateur courant (tous si administrateur).
 */
export async function filtrerConteneursVisiblesPourUtilisateur<
  T extends { id: string },
>(
  depot: ContainerOwnershipRepository,
  utilisateur: UtilisateurPublic,
  conteneurs: T[],
): Promise<T[]> {
  if (estRoleAdministrateur(utilisateur.role)) {
    return conteneurs;
  }
  return filtrerConteneursParProprieteUtilisateur(
    depot,
    utilisateur.id,
    conteneurs,
  );
}
