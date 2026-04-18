import { appelerPasserelle } from "../lab/passerelleClient.js";

/** Gabarit renvoyé par `GET /templates` : fusion par défaut pour une création Docker rapide. */
export type GabaritInstancePasserelle = {
  id: string;
  name: string;
  description: string;
  imageCatalogId: string;
  category: string;
  defaultConfig: Record<string, unknown>;
};

type ReponseListeTemplates = {
  templates?: GabaritInstancePasserelle[];
};

/**
 * Charge les gabarits d'instance exposés par `GET /templates` (catalogue package, sans appel au moteur Docker).
 */
export async function chargerTemplatesDepuisPasserelle(): Promise<GabaritInstancePasserelle[]> {
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
