import { z } from "zod";

/** Liste des valeurs Prisma GameType synchronisées avec `schema.prisma`. */
const valeursGameTypeSchema = [
  "MINECRAFT_JAVA",
  "MINECRAFT_BEDROCK",
  "VALHEIM",
  "TERRARIA",
  "SATISFACTORY",
  "ARK",
  "CSGO",
  "CUSTOM",
] as const;

/** Corps de création d’une instance jeu : quotas et variables d’environnement métier (nom conteneur dérivé côté serveur). */
export const corpsCreationInstanceServeurJeuxSchema = z.object({
  name: z.string().min(1).max(255),
  gameType: z.enum(valeursGameTypeSchema),
  memoryMb: z.number().int().positive().max(524_288),
  cpuCores: z.number().positive().max(512),
  diskGb: z.number().int().positive().max(10_000),
  env: z.record(z.string(), z.string()).optional(),
});
