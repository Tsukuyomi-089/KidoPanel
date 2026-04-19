import type { DockerClient } from "../docker-connection.js";
import {
  extrairePublicationsDepuisEntreeListeDocker,
  idsEntreeListeCorrespondentAReference,
} from "./extraire-publications-depuis-liste-docker.js";
import { extrairePublicationsHoteNonLoopbackDepuisInspection } from "./extraire-publications-hote-depuis-inspection-docker.js";
import { extrairePublicationsReseauHoteDepuisInspection } from "./extraire-publications-reseau-hote-depuis-inspection.js";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

function attendreMs(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

function fusionnerPublications(
  a: PublicationHotePareFeu[],
  b: PublicationHotePareFeu[],
): PublicationHotePareFeu[] {
  const vu = new Map<string, PublicationHotePareFeu>();
  for (const p of [...a, ...b]) {
    vu.set(`${p.protocole}:${String(p.numero)}`, p);
  }
  return [...vu.values()];
}

/**
 * Agrège les ports hôte publiés après démarrage : inspection (NAT), mode host, re-tentatives
 * si le moteur Docker met du temps à remplir les mappings, puis repli sur `listContainers`.
 */
export async function collecterPublicationsHoteApresDemarrageDocker(
  docker: DockerClient,
  idConteneur: string,
): Promise<{ publications: PublicationHotePareFeu[]; idCanonique: string }> {
  const nombreTentativesInspection = 12;
  const delaiEntreTentativesMs = 100;

  let inspection = await docker.getContainer(idConteneur).inspect();
  const idCanonique = inspection.Id;

  for (let t = 0; t < nombreTentativesInspection; t++) {
    const depuisNat = extrairePublicationsHoteNonLoopbackDepuisInspection(inspection);
    const depuisHost = extrairePublicationsReseauHoteDepuisInspection(inspection);
    const fusion = fusionnerPublications(depuisNat, depuisHost);
    if (fusion.length > 0) {
      return { publications: fusion, idCanonique };
    }
    if (t < nombreTentativesInspection - 1) {
      await attendreMs(delaiEntreTentativesMs);
      inspection = await docker.getContainer(idConteneur).inspect();
    }
  }

  const liste = await docker.listContainers({ all: true });
  const ligne = liste.find((c) =>
    idsEntreeListeCorrespondentAReference(c.Id, idCanonique),
  );
  if (ligne !== undefined) {
    const depuisListe = extrairePublicationsDepuisEntreeListeDocker(ligne);
    if (depuisListe.length > 0) {
      return {
        publications: fusionnerPublications(depuisListe, []),
        idCanonique,
      };
    }
  }

  return { publications: [], idCanonique };
}
