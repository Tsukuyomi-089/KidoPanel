import type { PrismaClient } from "@kidopanel/database";

/** Persistance des ponts réseau Docker logiques par utilisateur (nom Docker aligné sur le moteur). */
export class ReseauInterneUtilisateurRepository {
  constructor(private readonly db: PrismaClient) {}

  async listerPourUtilisateur(userId: string) {
    return this.db.userInternalNetwork.findMany({
      where: { userId },
      orderBy: { creeLe: "desc" },
    });
  }

  async trouverPourUtilisateur(idReseau: string, userId: string) {
    return this.db.userInternalNetwork.findFirst({
      where: { id: idReseau, userId },
    });
  }

  async enregistrerApresCreationDocker(entree: {
    id: string;
    userId: string;
    nomAffichage: string;
    nomDocker: string;
    sousReseauCidr: string;
    passerelleIpv4: string;
    sansRouteVersInternetExterne: boolean;
  }) {
    return this.db.userInternalNetwork.create({
      data: entree,
    });
  }

  async supprimer(idReseau: string) {
    await this.db.userInternalNetwork.delete({ where: { id: idReseau } });
  }

  /** Compte les instances jeu et web encore rattachées à ce pont (empêche la suppression Docker). */
  async compterInstancesLiees(idReseau: string): Promise<number> {
    const [jeu, web] = await Promise.all([
      this.db.gameServerInstance.count({
        where: { reseauInterneUtilisateurId: idReseau },
      }),
      this.db.webInstance.count({
        where: { reseauInterneUtilisateurId: idReseau },
      }),
    ]);
    return jeu + web;
  }
}
