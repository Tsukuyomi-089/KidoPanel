import type { PrismaClient } from "@kidopanel/database";

/** Résolution du nom Docker du pont utilisateur pour une instance web. */
export class DepotReseauInterneUtilisateur {
  constructor(private readonly db: PrismaClient) {}

  async trouverPourUtilisateur(idReseau: string, utilisateurId: string) {
    return this.db.userInternalNetwork.findFirst({
      where: { id: idReseau, userId: utilisateurId },
    });
  }
}
