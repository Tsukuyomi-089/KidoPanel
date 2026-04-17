import type { EntreeImageOfficielleCatalogue } from "@kidopanel/container-catalog";
import type { DockerClient } from "./docker-connection.js";
import { executerTirageImageDocker } from "./docker/image.service.js";
import { wrapDockerError } from "./docker/wrap-docker-operation.js";
import { isContainerEngineError } from "./errors.js";
import { journaliserMoteur } from "./observabilite/journal-json.js";

/** Détecte un code HTTP 404 sur une erreur dockerode typique. */
function estErreurDocker404(err: unknown): boolean {
  if (err && typeof err === "object" && "statusCode" in err) {
    const sc = (err as { statusCode?: number }).statusCode;
    return sc === 404;
  }
  return false;
}

/**
 * Contrat du service : garantir la présence locale d’une image déjà validée par le catalogue,
 * en déclenchant au plus un tirage depuis le registre pour cette référence exacte.
 */
export interface ServiceTirageImageCatalogue {
  garantirImageCatalogueSurHote(
    entree: EntreeImageOfficielleCatalogue,
    requestId: string | undefined,
  ): Promise<void>;
}

/**
 * Fabrique le service de tirage contrôlé : aucune référence Docker n’est utilisée sans provenir
 * d’une entrée catalogue préalablement acceptée par {@link validerImageCatalogueAvantCreation}.
 */
export function creerServiceTirageImageCatalogue(
  docker: DockerClient,
): ServiceTirageImageCatalogue {
  return {
    async garantirImageCatalogueSurHote(entree, requestId) {
      const ref = entree.referenceDocker;
      try {
        await docker.getImage(ref).inspect();
        return;
      } catch (err) {
        if (!estErreurDocker404(err)) {
          wrapDockerError(err);
        }
      }

      journaliserMoteur({
        niveau: "info",
        message: "image_pull_start",
        requestId,
        metadata: {
          idCatalogue: entree.id,
          referenceDocker: ref,
        },
      });

      try {
        await executerTirageImageDocker(docker, ref);
      } catch (err) {
        journaliserMoteur({
          niveau: "error",
          message: "image_pull_failed",
          requestId,
          metadata: {
            idCatalogue: entree.id,
            referenceDocker: ref,
            codeErreur: isContainerEngineError(err) ? err.code : "inconnu",
          },
        });
        throw err;
      }

      journaliserMoteur({
        niveau: "info",
        message: "image_pull_success",
        requestId,
        metadata: {
          idCatalogue: entree.id,
          referenceDocker: ref,
        },
      });
    },
  };
}
