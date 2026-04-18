import type { ContainerInspectInfo } from "dockerode";

/**
 * Retourne l’adresse IPv4 privée du conteneur sur le réseau nommé, depuis le résultat d’inspection Docker.
 */
export function extraireIpv4ConteneurSurReseauNomme(
  inspection: ContainerInspectInfo,
  nomReseau: string,
): string | undefined {
  const plage = inspection.NetworkSettings?.Networks;
  if (!plage || typeof plage !== "object") {
    return undefined;
  }
  const attachement = plage[nomReseau] as { IPAddress?: string } | undefined;
  const ip = attachement?.IPAddress;
  if (typeof ip !== "string") {
    return undefined;
  }
  const normalise = ip.trim();
  return normalise.length > 0 ? normalise : undefined;
}
