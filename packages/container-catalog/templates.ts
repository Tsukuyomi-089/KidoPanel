/** Catégorie métier d’un modèle d’instance présentée au panel. */
export type CategorieModeleInstance = "web" | "db" | "runtime" | "game";

/**
 * Gabarit d’instance exposé au panel : préconfiguration reliée au catalogue d’images Docker (`imageCatalogId`).
 */
export type InstanceTemplate = {
  id: string;
  name: string;
  description: string;
  imageCatalogId: string;
  /** Fragment de corps `POST /containers` fusionné avec une configuration utilisateur facultative. */
  defaultConfig: Record<string, unknown>;
  category: CategorieModeleInstance;
};

/**
 * Liste des modèles prêts pour le flux guidé « créer une instance » (sans saisie libre d’image Docker).
 */
export const LISTE_MODELES_INSTANCE: readonly InstanceTemplate[] = [
  {
    id: "tmpl-hebergement-nginx",
    name: "Site web — Nginx",
    description:
      "Serveur HTTP pour contenus statiques ou relais léger ; exposition HTTP typique.",
    imageCatalogId: "nginx",
    category: "web",
    defaultConfig: {
      name: "instance-nginx",
      exposedPorts: ["80/tcp"],
      hostConfig: {
        portBindings: {
          "80/tcp": [{ hostIp: "", hostPort: "8080" }],
        },
      },
    },
  },
  {
    id: "tmpl-runtime-node",
    name: "Application — Node.js",
    description:
      "Runtime JavaScript pour services ou scripts ; adaptez la commande selon votre projet.",
    imageCatalogId: "node",
    category: "runtime",
    defaultConfig: {
      name: "instance-node",
      exposedPorts: ["3000/tcp"],
      cmd: ["node", "--version"],
    },
  },
  {
    id: "tmpl-cache-redis",
    name: "Cache — Redis",
    description:
      "Stockage clé-valeur en mémoire pour cache ou files d’attente courte durée.",
    imageCatalogId: "redis",
    category: "db",
    defaultConfig: {
      name: "instance-redis",
      exposedPorts: ["6379/tcp"],
    },
  },
  {
    id: "tmpl-base-postgres",
    name: "Base — PostgreSQL",
    description:
      "Serveur relationnel ; définissez un mot de passe fort avant exposition réseau.",
    imageCatalogId: "postgres",
    category: "db",
    defaultConfig: {
      name: "instance-postgres",
      exposedPorts: ["5432/tcp"],
      env: {
        POSTGRES_PASSWORD: "changez_ce_mot_de_passe",
        POSTGRES_USER: "kidopanel",
      },
    },
  },
];

const indexParIdentifiantModele = new Map<string, InstanceTemplate>(
  LISTE_MODELES_INSTANCE.map((m) => [m.id, m]),
);

/** Vue immuable pour les réponses HTTP et le panel. */
export function listeTemplates(): readonly InstanceTemplate[] {
  return LISTE_MODELES_INSTANCE;
}

/** Résout un modèle par identifiant pour validation passerelle ou préremplissage UI. */
export function trouverTemplateParId(
  identifiant: string,
): InstanceTemplate | undefined {
  return indexParIdentifiantModele.get(identifiant.trim());
}
