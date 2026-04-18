import {
  analyserReferenceDockerLibre,
  trouverEntreeCatalogueParId,
  type EntreeImageOfficielleCatalogue,
} from "@kidopanel/container-catalog";
import type { ContainerCreateSpec } from "./types.js";
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
      "L’identifiant d’image catalogue (`imageCatalogId`) est obligatoire lorsque `imageReference` est absent.",
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

/** Résultat unique pour enrichir les journaux et passer la chaîne Docker à dockerode. */
export type ResolutionImagePourCreationSpec =
  | {
      mode: "catalogue";
      referenceDocker: string;
      idCatalogue: string;
    }
  | {
      mode: "libre";
      referenceDocker: string;
    };

/**
 * Choisit la référence Docker utilisée pour le tirage et la création : préfère `imageReference`
 * lorsqu’elle est renseignée et valide, sinon résout le catalogue.
 */
export function resoudreImagePourCreation(
  spec: ContainerCreateSpec,
  requestId: string | undefined,
): ResolutionImagePourCreationSpec {
  const bruteLibre = spec.imageReference?.trim();
  const possedeLibre =
    typeof spec.imageReference === "string" &&
    bruteLibre !== undefined &&
    bruteLibre.length > 0;

  if (possedeLibre) {
    const analyse = analyserReferenceDockerLibre(spec.imageReference ?? "");
    if (!analyse.ok) {
      journaliserMoteur({
        niveau: "warn",
        message: "image_validation_failed",
        requestId,
        metadata: { cause: "reference_libre_invalide", detail: analyse.message },
      });
      throw new ContainerEngineError("INVALID_SPEC", analyse.message);
    }
    journaliserMoteur({
      niveau: "info",
      message: "reference_docker_libre_acceptee",
      requestId,
      metadata: {
        referenceDocker: analyse.valeurNormalisee,
      },
    });
    return {
      mode: "libre",
      referenceDocker: analyse.valeurNormalisee,
    };
  }

  const entree = validerImageCatalogueAvantCreation(spec.imageCatalogId, requestId);
  return {
    mode: "catalogue",
    referenceDocker: entree.referenceDocker,
    idCatalogue: entree.id,
  };
}
