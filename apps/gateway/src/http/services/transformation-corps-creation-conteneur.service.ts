import { trouverTemplateParId } from "@kidopanel/container-catalog";
import { fusionProfondeEnregistrementsJson } from "../util/fusion-profonde-enregistrements-json.js";
import { ErreurCorpsCreationInstance } from "./erreur-corps-creation-instance.js";

/**
 * Transforme un corps JSON client éventuellement basé sur `templateId` vers la charge attendue par le moteur
 * (`imageCatalogId` issu du gabarit, fusion profonde avec `configuration` et champs hors gabarit).
 */
export function transformerCorpsCreationConteneurPourMoteur(brut: unknown): unknown {
  if (!brut || typeof brut !== "object" || Array.isArray(brut)) {
    return brut;
  }
  const entree = brut as Record<string, unknown>;
  const templateIdBrut = entree.templateId;
  if (typeof templateIdBrut !== "string" || templateIdBrut.trim().length === 0) {
    return brut;
  }
  const gabarit = trouverTemplateParId(templateIdBrut.trim());
  if (gabarit === undefined) {
    throw new ErreurCorpsCreationInstance(
      "TEMPLATE_INSTANCE_INCONNU",
      "Le modèle d’instance indiqué est inconnu ou n’est plus disponible.",
    );
  }
  const surchargeConfiguration =
    entree.configuration !== undefined &&
    typeof entree.configuration === "object" &&
    entree.configuration !== null &&
    !Array.isArray(entree.configuration)
      ? (entree.configuration as Record<string, unknown>)
      : {};

  const baseDefaut = { ...(gabarit.defaultConfig as Record<string, unknown>) };
  const corpsModeleEtConfig = fusionProfondeEnregistrementsJson(
    baseDefaut,
    surchargeConfiguration,
  );

  const resteHorsGabarit = { ...entree };
  delete resteHorsGabarit.templateId;
  delete resteHorsGabarit.configuration;
  delete resteHorsGabarit.imageCatalogId;
  delete resteHorsGabarit.imageReference;

  const corpsFinal = fusionProfondeEnregistrementsJson(
    corpsModeleEtConfig,
    resteHorsGabarit as Record<string, unknown>,
  );
  corpsFinal.imageCatalogId = gabarit.imageCatalogId;
  return corpsFinal;
}
