-- Domaines gérés par le proxy Nginx partagé et variables d’environnement persistées pour les instances web.

ALTER TABLE "WebInstance" ADD COLUMN "env" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "DomaineProxy" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "webInstanceId" UUID,
    "domaine" TEXT NOT NULL,
    "cibleInterne" TEXT NOT NULL,
    "portCible" INTEGER NOT NULL,
    "sslActif" BOOLEAN NOT NULL DEFAULT false,
    "cheminCertificat" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomaineProxy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DomaineProxy_domaine_key" ON "DomaineProxy"("domaine");

ALTER TABLE "DomaineProxy" ADD CONSTRAINT "DomaineProxy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DomaineProxy" ADD CONSTRAINT "DomaineProxy_webInstanceId_fkey" FOREIGN KEY ("webInstanceId") REFERENCES "WebInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
