import type { ImageCatalogId } from "./images-officielles.js";

/** Gabarit jeu aligné sur la feuille de route PaaS : métadonnées UX et contraintes d’environnement exposées au panel. */
export type GabaritJeuCatalogueInstance = {
  id: string;
  name: string;
  description: string;
  imageCatalogId: ImageCatalogId;
  category: "game";
  requiredEnv: readonly string[];
  optionalEnv: readonly string[];
  defaultPorts: readonly number[];
  defaultMemoryMb: number;
  defaultCpuCores: number;
  installTimeEstimateSeconds: number;
};

/**
 * Gabarits prêts pour une création orchestrée via `server-service` (sans saisie libre d’image hors catalogue).
 */
export const LISTE_GABARITS_JEU_INSTANCE: readonly GabaritJeuCatalogueInstance[] =
  [
    {
      id: "tmpl-jeu-minecraft-java",
      name: "Minecraft Java",
      description:
        "Serveur Minecraft Java (Docker itzg/minecraft-server) avec chargement JVM adapté.",
      imageCatalogId: "jeu-minecraft-java",
      category: "game",
      requiredEnv: ["EULA"],
      optionalEnv: [
        "SERVER_NAME",
        "DIFFICULTY",
        "MODE",
        "MEMORY",
        "OPS",
      ],
      defaultPorts: [25565],
      defaultMemoryMb: 3072,
      defaultCpuCores: 2,
      installTimeEstimateSeconds: 180,
    },
    {
      id: "tmpl-jeu-minecraft-bedrock",
      name: "Minecraft Bedrock",
      description:
        "Serveur Minecraft Bedrock pour clients multiplateformes (image itzg dédiée).",
      imageCatalogId: "jeu-minecraft-bedrock",
      category: "game",
      requiredEnv: [],
      optionalEnv: ["SERVER_NAME", "GAMEMODE", "DIFFICULTY"],
      defaultPorts: [19132],
      defaultMemoryMb: 1024,
      defaultCpuCores: 1,
      installTimeEstimateSeconds: 120,
    },
    {
      id: "tmpl-jeu-valheim",
      name: "Valheim",
      description: "Monde Valheim dédié ; prévoir nom du monde et mot de passe serveur.",
      imageCatalogId: "jeu-valheim",
      category: "game",
      requiredEnv: ["SERVER_PASS", "SERVER_NAME"],
      optionalEnv: ["WORLD_NAME", "PUBLIC"],
      defaultPorts: [2456, 2457],
      defaultMemoryMb: 4096,
      defaultCpuCores: 2,
      installTimeEstimateSeconds: 240,
    },
    {
      id: "tmpl-jeu-terraria",
      name: "Terraria",
      description: "Serveur Terraria ; configurer mot de passe et slots selon l’image.",
      imageCatalogId: "jeu-terraria",
      category: "game",
      requiredEnv: [],
      optionalEnv: ["WORLD_NAME", "MAX_PLAYERS", "PASSWORD"],
      defaultPorts: [7777],
      defaultMemoryMb: 1024,
      defaultCpuCores: 1,
      installTimeEstimateSeconds: 90,
    },
    {
      id: "tmpl-jeu-satisfactory",
      name: "Satisfactory",
      description:
        "Serveur Satisfactory ; temps de premier démarrage et espace disque importants.",
      imageCatalogId: "jeu-satisfactory",
      category: "game",
      requiredEnv: [],
      optionalEnv: ["MAXPLAYERS", "STEAMCMD_ARGS"],
      defaultPorts: [7777, 15000, 15777],
      defaultMemoryMb: 8192,
      defaultCpuCores: 4,
      installTimeEstimateSeconds: 600,
    },
    {
      id: "tmpl-jeu-cs2",
      name: "Counter-Strike 2",
      description:
        "Serveur CS2 ; tokens Steam et configuration dédiée selon la documentation joedwards32/cs2.",
      imageCatalogId: "jeu-cs2",
      category: "game",
      requiredEnv: ["STEAMUSER", "STEAMPASS"],
      optionalEnv: ["CS2_ARGS", "TICKRATE"],
      defaultPorts: [27015, 27020],
      defaultMemoryMb: 4096,
      defaultCpuCores: 3,
      installTimeEstimateSeconds: 900,
    },
    {
      id: "tmpl-jeu-ark",
      name: "ARK Survival Evolved",
      description:
        "Serveur ARK ; valider l’image Docker choisie sur votre hôte avant production.",
      imageCatalogId: "jeu-ark",
      category: "game",
      requiredEnv: [],
      optionalEnv: ["SESSION_NAME", "SERVER_MAP", "SERVER_PASSWORD"],
      defaultPorts: [7777, 27015, 32330],
      defaultMemoryMb: 8192,
      defaultCpuCores: 4,
      installTimeEstimateSeconds: 1200,
    },
  ];

const indexGabaritsJeu = new Map<string, GabaritJeuCatalogueInstance>(
  LISTE_GABARITS_JEU_INSTANCE.map((g) => [g.id, g]),
);

/** Liste immuable pour les réponses HTTP et le service serveur. */
export function listeGabaritsJeuCatalogue(): readonly GabaritJeuCatalogueInstance[] {
  return LISTE_GABARITS_JEU_INSTANCE;
}

/** Résout un gabarit jeu par identifiant pour validation ou composition Docker. */
export function trouverGabaritJeuParId(
  identifiant: string,
): GabaritJeuCatalogueInstance | undefined {
  return indexGabaritsJeu.get(identifiant.trim());
}
