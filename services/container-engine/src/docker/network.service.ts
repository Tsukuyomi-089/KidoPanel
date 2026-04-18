import type { DockerClient } from "../docker-connection.js";
import { journaliserMoteur } from "../observabilite/journal-json.js";
import { NOM_RESEAU_BRIDGE_INTERNE_KIDOPANEL } from "./reseau-interne-kidopanel.constantes.js";

/** Filtre Docker Engine pour la recherche de réseaux par nom exact (JSON sérialisé attendu par l’API). */
function filtreNomReseauDocker(nomReseau: string): string {
  return JSON.stringify({ name: [nomReseau] });
}

/**
 * Garantit l’existence du réseau bridge interne : inspection par liste filtrée puis création si absent.
 */
export async function garantirReseauInterneKidopanelExiste(
  docker: DockerClient,
  nomReseau: string,
  options?: { requestId?: string },
): Promise<void> {
  const liste = await docker.listNetworks({
    filters: filtreNomReseauDocker(nomReseau),
  });
  const existe = liste.some((n) => n.Name === nomReseau);
  if (existe) {
    journaliserMoteur({
      niveau: "info",
      message: "reseau_interne_kidopanel_deja_present",
      requestId: options?.requestId,
      metadata: { nomReseau },
    });
    return;
  }
  await docker.createNetwork({
    Name: nomReseau,
    Driver: "bridge",
    CheckDuplicate: true,
  });
  journaliserMoteur({
    niveau: "info",
    message: "reseau_interne_kidopanel_cree",
    requestId: options?.requestId,
    metadata: { nomReseau },
  });
}

/**
 * Variante avec nom par défaut du projet : réseau unique `kidopanel-network`.
 */
export async function garantirReseauKidopanelNetworkParDefaut(
  docker: DockerClient,
  options?: { requestId?: string },
): Promise<void> {
  await garantirReseauInterneKidopanelExiste(
    docker,
    NOM_RESEAU_BRIDGE_INTERNE_KIDOPANEL,
    options,
  );
}
