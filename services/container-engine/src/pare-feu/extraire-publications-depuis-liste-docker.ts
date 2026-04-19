import type { ContainerInfo } from "dockerode";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

function normaliserIdDockerCompare(id: string): string {
  return id.replace(/^sha256:/i, "").toLowerCase();
}

/**
 * Indique si un id de `docker ps` (long ou tronqué) désigne le même conteneur.
 */
export function idsEntreeListeCorrespondentAReference(
  idListe: string,
  idReference: string,
): boolean {
  const a = normaliserIdDockerCompare(idListe);
  const b = normaliserIdDockerCompare(idReference);
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * Extrait les publications hôte depuis une ligne `listContainers` (souvent remplie avant l’inspect).
 */
export function extrairePublicationsDepuisEntreeListeDocker(
  entree: ContainerInfo,
): PublicationHotePareFeu[] {
  const vu = new Map<string, PublicationHotePareFeu>();

  for (const p of entree.Ports ?? []) {
    if (typeof p.PublicPort !== "number" || p.PublicPort < 1 || p.PublicPort > 65_535) {
      continue;
    }
    const protocole = p.Type === "udp" ? "udp" : "tcp";
    const ip = typeof p.IP === "string" ? p.IP.trim() : "";
    if (ip === "127.0.0.1" || ip === "::1") {
      continue;
    }
    vu.set(`${protocole}:${String(p.PublicPort)}`, {
      numero: p.PublicPort,
      protocole,
    });
  }

  return [...vu.values()];
}
