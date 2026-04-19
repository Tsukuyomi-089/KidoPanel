import type { ContainerInspectInfo } from "dockerode";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

/**
 * En mode réseau « host », Docker ne remplit souvent pas `NetworkSettings.Ports` (pas de NAT).
 * On dérive alors les ports à ouvrir sur le pare-feu depuis `Config.ExposedPorts`.
 */
export function extrairePublicationsReseauHoteDepuisInspection(
  inspection: ContainerInspectInfo,
): PublicationHotePareFeu[] {
  const mode = inspection.HostConfig?.NetworkMode?.trim() ?? "";
  if (mode !== "host") {
    return [];
  }

  const exposes = inspection.Config?.ExposedPorts;
  if (exposes === undefined || exposes === null || typeof exposes !== "object") {
    return [];
  }

  const vu = new Map<string, PublicationHotePareFeu>();

  for (const clePort of Object.keys(exposes)) {
    const correspondance = /^(\d+)\/(tcp|udp)$/i.exec(clePort);
    if (!correspondance) {
      continue;
    }
    const numero = Number(correspondance[1]);
    const protocole = correspondance[2].toLowerCase() as "tcp" | "udp";
    if (!Number.isFinite(numero) || numero < 1 || numero > 65_535) {
      continue;
    }
    vu.set(`${protocole}:${String(numero)}`, { numero, protocole });
  }

  return [...vu.values()];
}
