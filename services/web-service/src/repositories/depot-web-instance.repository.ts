import type { PrismaClient, InstanceStatus, WebStack } from "@kidopanel/database";
import { Prisma } from "@kidopanel/database";

type DonneesNouvelleInstanceWeb = {
  id: string;
  userId: string;
  name: string;
  techStack: WebStack;
  memoryMb: number;
  diskGb: number;
  env: Prisma.InputJsonValue;
  status: InstanceStatus;
  reseauInterneUtilisateurId?: string | null;
};

const inclureDomaines = {
  domaines: {
    select: {
      id: true,
      domaine: true,
      sslActif: true,
      portCible: true,
    },
  },
} as const;

/**
 * Accès Prisma aux instances web : point d’entrée unique pour ce service.
 */
export class DepotWebInstance {
  constructor(private readonly db: PrismaClient) {}

  async trouverParId(id: string) {
    return this.db.webInstance.findUnique({
      where: { id },
      include: inclureDomaines,
    });
  }

  async listerParUtilisateur(userId: string) {
    return this.db.webInstance.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: inclureDomaines,
    });
  }

  async listerTous() {
    return this.db.webInstance.findMany({
      orderBy: { createdAt: "desc" },
      include: inclureDomaines,
    });
  }

  async creer(d: DonneesNouvelleInstanceWeb) {
    return this.db.webInstance.create({ data: d });
  }

  async mettreAJour(id: string, donnees: Prisma.WebInstanceUpdateInput) {
    return this.db.webInstance.update({ where: { id }, data: donnees });
  }

  async supprimer(id: string) {
    await this.db.webInstance.delete({ where: { id } });
  }
}
