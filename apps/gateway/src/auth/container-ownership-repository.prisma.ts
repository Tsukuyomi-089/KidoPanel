import type { PrismaClient } from "@kydopanel/database";
import { prefixeDocker } from "./docker-identifiant-conteneur.js";

/**
 * Stockage des associations utilisateur ↔ identifiant Docker ; le moteur de conteneurs reste la source de vérité runtime.
 */
export class ContainerOwnershipRepository {
  constructor(private readonly db: PrismaClient) {}

  async addOwnership(userId: string, containerId: string): Promise<void> {
    await this.db.containerOwnership.create({
      data: {
        userId,
        containerId: containerId.trim(),
      },
    });
  }

  async getContainerIdsByUser(userId: string): Promise<string[]> {
    const lignes = await this.db.containerOwnership.findMany({
      where: { userId },
      select: { containerId: true },
    });
    return lignes.map((l) => l.containerId);
  }

  /**
   * Supprime toute ligne dont l’identifiant Docker partage le même préfixe 12 caractères que le paramètre (comportement aligné sur l’ancien dépôt mémoire).
   */
  async removeOwnership(containerId: string): Promise<void> {
    const p = prefixeDocker(containerId);
    await this.db.$executeRaw`
      DELETE FROM "ContainerOwnership"
      WHERE LOWER(SUBSTRING(TRIM("containerId"), 1, 12)) = ${p}
    `;
  }
}
