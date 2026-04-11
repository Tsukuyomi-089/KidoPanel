import { createRequire } from "node:module";
import type { PrismaClient } from "@prisma/client";

/**
 * @prisma/client est publié en CommonJS ; sous Node en ESM, l’import nommé échoue (erreur « Named export PrismaClient not found »).
 * Chargement via require pour compatibilité avec gateway et autres consommateurs « type module ».
 */
const require = createRequire(import.meta.url);
const { PrismaClient: ConstructeurPrismaClient } = require(
  "@prisma/client",
) as { PrismaClient: new () => PrismaClient };

const globalPourPrisma = globalThis as unknown as {
  prismaClientPartage?: PrismaClient;
};

/**
 * Instance unique de PrismaClient pour tout le processus Node (évite la multiplication des connexions en développement avec rechargement à chaud).
 */
export const prisma: PrismaClient =
  globalPourPrisma.prismaClientPartage ?? new ConstructeurPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalPourPrisma.prismaClientPartage = prisma;
}
