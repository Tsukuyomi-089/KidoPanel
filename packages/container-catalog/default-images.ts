/**
 * Références d’images de base proposées dans l’interface (Docker Hub ou équivalent).
 * Le panel peut s’en servir pour des listes déroulantes sans exposer la mécanique Docker.
 */
export const IMAGES_BASE_CATALOGUE = [
  {
    id: "nginx",
    reference: "nginx:alpine",
    titre: "Nginx",
    description: "Serveur web et reverse proxy léger.",
  },
  {
    id: "node",
    reference: "node:20-alpine",
    titre: "Node.js",
    description: "Runtime JavaScript pour applications et API.",
  },
  {
    id: "postgres",
    reference: "postgres:16-alpine",
    titre: "PostgreSQL",
    description: "Base de données relationnelle.",
  },
  {
    id: "redis",
    reference: "redis:7-alpine",
    titre: "Redis",
    description: "Magasin clé-valeur et cache en mémoire.",
  },
] as const;

export type EntreeCatalogueImage = (typeof IMAGES_BASE_CATALOGUE)[number];
