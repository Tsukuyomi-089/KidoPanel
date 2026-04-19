import type { ContainerInspectInfo } from "dockerode";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

/**
 * Dérive les ports hôte réellement publiés (non limités à la loopback) depuis l’inspection Docker.
 */
export function extrairePublicationsHoteNonLoopbackDepuisInspection(
  inspection: ContainerInspectInfo,
): PublicationHotePareFeu[] {
  const ports = inspection.NetworkSettings?.Ports;
  if (ports === undefined || ports === null || typeof ports !== "object") {
    return [];
  }

  const vu = new Map<string, PublicationHotePareFeu>();

  for (const [clePort, liaisons] of Object.entries(ports)) {
    const correspondance = /^(\d+)\/(tcp|udp)$/.exec(clePort);
    if (!correspondance) {
      continue;
    }
    const protocole = correspondance[2] as "tcp" | "udp";
    if (!Array.isArray(liaisons) || liaisons.length === 0) {
      continue;
    }
    const uniquementLoopback = liaisons.every((liaison) => {
      const ip = typeof liaison.HostIp === "string" ? liaison.HostIp.trim() : "";
      return ip === "127.0.0.1" || ip === "::1";
    });
    if (uniquementLoopback) {
      continue;
    }
    for (const liaison of liaisons) {
      const hote = typeof liaison.HostPort === "string" ? liaison.HostPort.trim() : "";
      if (hote.length === 0) {
        continue;
      }
      const numero = Number(hote);
      if (!Number.isFinite(numero) || numero < 1 || numero > 65_535) {
        continue;
      }
      const cleUnique = `${protocole}:${String(numero)}`;
      vu.set(cleUnique, { numero, protocole });
    }
  }

  return [...vu.values()];
}
