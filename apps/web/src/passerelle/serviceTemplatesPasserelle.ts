import type { InstanceTemplate } from "@kidopanel/container-catalog";
import { appelerPasserelle } from "../lab/passerelleClient.js";

type ReponseListeTemplates = {
  templates?: InstanceTemplate[];
};

/**
 * Charge les gabarits d’instance exposés par `GET /templates` (catalogue package, sans appel au moteur Docker).
 */
export async function chargerTemplatesDepuisPasserelle(): Promise<InstanceTemplate[]> {
  const reponse = await appelerPasserelle("/templates", { method: "GET" });
  if (!reponse.ok) {
    const texte = await reponse.text();
    throw new Error(
      `Liste des gabarits indisponible (HTTP ${String(reponse.status)}) : ${texte}`,
    );
  }
  const donnees = (await reponse.json()) as ReponseListeTemplates;
  return Array.isArray(donnees.templates) ? donnees.templates : [];
}
