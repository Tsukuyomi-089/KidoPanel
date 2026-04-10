import { PrismaClient } from "@prisma/client";

const globalPourPrisma = globalThis as unknown as {
  prismaClientPartage?: PrismaClient;
};

/**
 * Instance unique de PrismaClient pour tout le processus Node (évite la multiplication des connexions en développement avec rechargement à chaud).
 */
export const prisma: PrismaClient =
  globalPourPrisma.prismaClientPartage ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalPourPrisma.prismaClientPartage = prisma;
}
