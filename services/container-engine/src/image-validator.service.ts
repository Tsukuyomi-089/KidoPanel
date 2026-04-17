import {
  trouverEntreeCatalogueParId,
  type EntreeImageOfficielleCatalogue,
} from "@kidopanel/container-catalog";
import { ContainerEngineError } from "./errors.js";
import { journaliserMoteur } from "./observabilite/journal-json.js";

/**
 * Vérifie que l’identifiant demandé figure dans le catalogue officiel avant toute opération Docker.
 * Lève `INVALID_SPEC` si l’identifiant est absent ; `IMAGE_NON_AUTORISEE` si inconnu du catalogue.
 */
export function validerImageCatalogueAvantCreation(
  idBrut: string | undefined,
  requestId: string | undefined,
): EntreeImageOfficielleCatalogue {
  const id = idBrut?.trim() ?? "";
  if (id.length === 0) {
    journaliserMoteur({
      niveau: "warn",
      message: "image_validation_failed",
      requestId,
      metadata: { cause: "id_catalogue_absent" },
    });
    throw new ContainerEngineError(
      "INVALID_SPEC",
      "L’identifiant d’image catalogue (`imageCatalogId`) est obligatoire.",
    );
  }

  const entree = trouverEntreeCatalogueParId(id);
  if (entree === undefined) {
    journaliserMoteur({
      niveau: "warn",
      message: "image_not_in_catalog",
      requestId,
      metadata: { idDemandee: id },
    });
    journaliserMoteur({
      niveau: "warn",
      message: "image_validation_failed",
      requestId,
      metadata: { idDemandee: id, cause: "hors_catalogue" },
    });
    throw new ContainerEngineError(
      "IMAGE_NON_AUTORISEE",
      `L’image « ${id} » n’est pas une image catalogue autorisée sur cette plateforme.`,
    );
  }

  journaliserMoteur({
    niveau: "info",
    message: "image_validation_success",
    requestId,
    metadata: {
      idCatalogue: entree.id,
      referenceDocker: entree.referenceDocker,
    },
  });

  return entree;
}
