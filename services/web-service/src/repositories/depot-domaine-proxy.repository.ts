import type { PrismaClient } from "@kidopanel/database";

/**
 * Persistance des domaines exposés via le proxy Nginx partagé.
 */
export class DepotDomaineProxy {
  constructor(private readonly db: PrismaClient) {}

  async listerParUtilisateur(userId: string) {
    return this.db.domaineProxy.findMany({
      where: { userId },
      orderBy: { creeLe: "desc" },
    });
  }

  /** Liste globale pour régénérer la configuration du proxy mutualisée entre comptes. */
  async listerTousOrdreDomaine() {
    return this.db.domaineProxy.findMany({
      orderBy: { domaine: "asc" },
    });
  }

  async trouverParIdPourUtilisateur(id: string, userId: string) {
    return this.db.domaineProxy.findFirst({
      where: { id, userId },
    });
  }

  async creer(donnees: {
    id: string;
    userId: string;
    webInstanceId?: string | null;
    domaine: string;
    cibleInterne: string;
    portCible: number;
    sslActif?: boolean;
    cheminCertificat?: string | null;
  }) {
    return this.db.domaineProxy.create({
      data: {
        id: donnees.id,
        userId: donnees.userId,
        webInstanceId: donnees.webInstanceId ?? null,
        domaine: donnees.domaine.trim().toLowerCase(),
        cibleInterne: donnees.cibleInterne.trim(),
        portCible: donnees.portCible,
        sslActif: donnees.sslActif ?? false,
        cheminCertificat: donnees.cheminCertificat ?? null,
      },
    });
  }

  async supprimer(id: string) {
    await this.db.domaineProxy.delete({ where: { id } });
  }
}
