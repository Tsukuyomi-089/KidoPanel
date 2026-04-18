import type { GabaritJeuCatalogueInstance } from "@kidopanel/container-catalog";
import { ErreurMetierInstanceJeux } from "../erreurs/erreurs-metier-instance-jeu.js";

/**
 * Fusionne les variables utilisateur avec les défauts du gabarit et refuse si une clé requise manque.
 */
export function validerEtFusionnerVariablesEnvJeux(params: {
  gabarit: GabaritJeuCatalogueInstance;
  variablesUtilisateur: Record<string, string>;
  memoireMbInstance: number;
}): Record<string, string> {
  const fusionne: Record<string, string> = {};
  fusionne.MEMORY = String(params.memoireMbInstance);
  for (const [cle, valeur] of Object.entries(params.variablesUtilisateur)) {
    fusionne[cle.trim()] = valeur;
  }
  const manquantes: string[] = [];
  for (const cle of params.gabarit.requiredEnv) {
    if (!(cle in fusionne) || fusionne[cle]?.trim() === "") {
      manquantes.push(cle);
    }
  }
  if (manquantes.length > 0) {
    throw new ErreurMetierInstanceJeux(
      "ENVIRONNEMENT_INSTANCE_INCOMPLET",
      `Variables d’environnement obligatoires absentes pour ce jeu : ${manquantes.join(", ")}.`,
      400,
      { manquantes },
    );
  }
  return fusionne;
}
