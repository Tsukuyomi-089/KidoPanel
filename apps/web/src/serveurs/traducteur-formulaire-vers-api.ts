import type { GabaritJeuCatalogueInstance } from "@kidopanel/container-catalog";
import type { CorpsCreationInstanceServeurJeux } from "../passerelle/serviceServeursJeuxPasserelle.js";
import type { TypeJeuInstancePanel } from "./types-instance-jeu-panel.js";

/** Corps minimal pour une instance jeu sans gabarit catalogue prédéfini. */
export function traduireServeurPersonnaliseVersCorpsApi(params: {
  nomServeur: string;
  memoryMb: number;
  cpuCores: number;
  diskGb: number;
}): CorpsCreationInstanceServeurJeux {
  return {
    name: params.nomServeur.trim(),
    gameType: "CUSTOM",
    memoryMb: params.memoryMb,
    cpuCores: params.cpuCores,
    diskGb: params.diskGb,
    env: {},
  };
}

const IDENTIFIANT_GABARIT_VERS_TYPE_JEU: Record<string, TypeJeuInstancePanel> = {
  "tmpl-jeu-minecraft-java": "MINECRAFT_JAVA",
  "tmpl-jeu-minecraft-bedrock": "MINECRAFT_BEDROCK",
  "tmpl-jeu-valheim": "VALHEIM",
  "tmpl-jeu-terraria": "TERRARIA",
  "tmpl-jeu-satisfactory": "SATISFACTORY",
  "tmpl-jeu-cs2": "CSGO",
  "tmpl-jeu-ark": "ARK",
};

/**
 * Traduit les valeurs brutes du formulaire de création de serveur
 * en corps JSON attendu par POST /serveurs-jeux/instances.
 * Les clés NOM_CONTAINER et PORT_HOTE sont des méta-champs réservés au panel Docker
 * et ne sont pas transmises au service jeu.
 */
export function traduireValeursFormulaireVersCorpsApi(params: {
  gabarit: GabaritJeuCatalogueInstance;
  nomServeur: string;
  memoryMb: number;
  cpuCores: number;
  diskGb: number;
  valeursChamps: Record<string, string>;
}): CorpsCreationInstanceServeurJeux {
  const CLES_META = new Set(["NOM_CONTAINER", "PORT_HOTE"]);

  const env: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(params.valeursChamps)) {
    if (!CLES_META.has(cle) && valeur.trim() !== "") {
      env[cle] = valeur.trim();
    }
  }

  if (params.gabarit.id === "tmpl-jeu-minecraft-java") {
    env.EULA = "TRUE";
  }

  const typeJeu = IDENTIFIANT_GABARIT_VERS_TYPE_JEU[params.gabarit.id];
  if (typeJeu === undefined) {
    throw new Error("Gabarit jeu sans correspondance de type Prisma.");
  }

  return {
    name: params.nomServeur.trim(),
    gameType: typeJeu,
    memoryMb: params.memoryMb,
    cpuCores: params.cpuCores,
    diskGb: params.diskGb,
    env,
  };
}
