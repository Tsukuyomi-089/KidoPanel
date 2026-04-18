-- Réseaux bridge Docker logiques par utilisateur et rattachement optionnel des instances.

CREATE TABLE "UserInternalNetwork" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "nomAffichage" TEXT NOT NULL,
    "nomDocker" TEXT NOT NULL,
    "sousReseauCidr" TEXT NOT NULL,
    "passerelleIpv4" TEXT NOT NULL,
    "sansRouteVersInternetExterne" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInternalNetwork_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserInternalNetwork_nomDocker_key" ON "UserInternalNetwork"("nomDocker");

CREATE UNIQUE INDEX "UserInternalNetwork_userId_nomAffichage_key" ON "UserInternalNetwork"("userId", "nomAffichage");

ALTER TABLE "UserInternalNetwork" ADD CONSTRAINT "UserInternalNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameServerInstance" ADD COLUMN "reseauInterneUtilisateurId" UUID;

ALTER TABLE "WebInstance" ADD COLUMN "reseauInterneUtilisateurId" UUID;

ALTER TABLE "GameServerInstance" ADD CONSTRAINT "GameServerInstance_reseauInterneUtilisateurId_fkey" FOREIGN KEY ("reseauInterneUtilisateurId") REFERENCES "UserInternalNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WebInstance" ADD CONSTRAINT "WebInstance_reseauInterneUtilisateurId_fkey" FOREIGN KEY ("reseauInterneUtilisateurId") REFERENCES "UserInternalNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
