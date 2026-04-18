import type { PrismaClient } from "@kidopanel/database";
import { randomUUID } from "node:crypto";

/**
 * Enregistre la propriété Docker côté passerelle pour les conteneurs créés par le service web.
 */
export class DepotProprieteConteneur {
  constructor(private readonly db: PrismaClient) {}

  async enregistrerProprietePourConteneur(
    utilisateurId: string,
    identifiantConteneurDocker: string,
  ): Promise<void> {
    await this.db.containerOwnership.create({
      data: {
        id: randomUUID(),
        userId: utilisateurId,
        containerId: identifiantConteneurDocker.trim(),
      },
    });
  }

  async retirerProprieteUtilisateurPourConteneur(
    utilisateurId: string,
    identifiantConteneurDocker: string,
  ): Promise<void> {
    const idNettoye = identifiantConteneurDocker.trim();
    await this.db.containerOwnership.deleteMany({
      where: {
        userId: utilisateurId,
        containerId: idNettoye,
      },
    });
  }
}
