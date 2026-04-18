import type { PrismaClient } from "@kidopanel/database";

/** Lecture des ponts réseau créés par l’utilisateur pour rattacher une instance jeu au bon nom Docker. */
export class DepotReseauInterneUtilisateur {
  constructor(private readonly db: PrismaClient) {}

  async trouverPourUtilisateur(idReseau: string, utilisateurId: string) {
    return this.db.userInternalNetwork.findFirst({
      where: { id: idReseau, userId: utilisateurId },
    });
  }
}
