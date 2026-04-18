import type { DockerClient } from "../docker-connection.js";
import type { ContainerCreateSpec, CreateContainerResult } from "../types.js";
import type { ServiceTirageImageMoteur } from "../image-puller.service.js";
import type { ServiceJournauxFichierConteneur } from "../journaux-fichier-conteneur/journaux-fichier-conteneur.service.js";
import { journaliserMoteur } from "../observabilite/journal-json.js";
import { resoudreImagePourCreation } from "../image-validator.service.js";
import { wrapDockerError } from "./wrap-docker-operation.js";
import { traduireOptionsCreationConteneur } from "./traduction-options-creation-conteneur.js";
import { garantirReseauKidopanelNetworkParDefaut } from "./network.service.js";
import { verifierPontReseauNomExisteSurHote } from "./reseau-utilisateur-docker.service.js";
import { appliquerAttachementReseauInterneKidopanelSurSpec } from "./appliquer-spec-reseau-interne.js";
import { extraireIpv4ConteneurSurReseauNomme } from "./extraction-ip-reseau-inspection.js";
import { NOM_RESEAU_BRIDGE_INTERNE_KIDOPANEL } from "./reseau-interne-kidopanel.constantes.js";

type MetaTirageCreation =
  | {
      mode: "catalogue";
      idCatalogue: string;
      referenceDocker: string;
    }
  | {
      mode: "libre";
      referenceDocker: string;
    };

function construireMetaTirageDepuisResolution(
  resolu: ReturnType<typeof resoudreImagePourCreation>,
): MetaTirageCreation {
  if (resolu.mode === "catalogue") {
    return {
      mode: "catalogue",
      idCatalogue: resolu.idCatalogue,
      referenceDocker: resolu.referenceDocker,
    };
  }
  return {
    mode: "libre",
    referenceDocker: resolu.referenceDocker,
  };
}

/**
 * Chaîne catalogue ou référence libre, création du réseau interne, attachement bridge,
 * création Docker et lecture de l’IPv4 privée depuis l’inspection du conteneur.
 */
export async function executerCreationConteneurDocker(
  deps: {
    docker: DockerClient;
    serviceTirageImage: ServiceTirageImageMoteur;
    journauxFichierConteneur?: ServiceJournauxFichierConteneur;
  },
  spec: ContainerCreateSpec,
  options?: { requestId?: string },
): Promise<CreateContainerResult> {
  const requestId = options?.requestId;
  const resolu = resoudreImagePourCreation(spec, requestId);
  const metaTirage = construireMetaTirageDepuisResolution(resolu);
  await deps.serviceTirageImage.garantirPresenceImagePourCreation(
    metaTirage,
    requestId,
  );
  const pontOptionnel = spec.reseauBridgeNom?.trim();
  if (pontOptionnel !== undefined && pontOptionnel.length > 0) {
    await verifierPontReseauNomExisteSurHote(deps.docker, pontOptionnel);
  } else {
    await garantirReseauKidopanelNetworkParDefaut(deps.docker, { requestId });
  }
  const specAvecReseau = appliquerAttachementReseauInterneKidopanelSurSpec(spec);
  const opts = traduireOptionsCreationConteneur(specAvecReseau, resolu.referenceDocker);
  try {
    const container = await deps.docker.createContainer(opts);
    let ipReseauInterne: string | undefined;
    try {
      const inspection = await container.inspect();
      const nomReseauPourIp =
        specAvecReseau.hostConfig?.networkMode?.trim() ??
        NOM_RESEAU_BRIDGE_INTERNE_KIDOPANEL;
      ipReseauInterne = extraireIpv4ConteneurSurReseauNomme(
        inspection,
        nomReseauPourIp,
      );
      if (ipReseauInterne !== undefined) {
        journaliserMoteur({
          niveau: "info",
          message: "creation_conteneur_ipv4_reseau_interne_lue",
          requestId,
          metadata: {
            idConteneur: container.id,
            nomReseau: nomReseauPourIp,
            ipReseauInterne,
          },
        });
      }
    } catch (errInspection) {
      journaliserMoteur({
        niveau: "warn",
        message: "creation_conteneur_inspection_post_creation_echouee",
        requestId,
        metadata: {
          idConteneur: container.id,
          codeErreur: String(errInspection),
        },
      });
    }
    journaliserMoteur({
      niveau: "info",
      message: "creation_conteneur_catalogue_terminee",
      requestId,
      metadata: {
        idConteneur: container.id,
        idCatalogue:
          resolu.mode === "catalogue" ? resolu.idCatalogue : undefined,
        referenceDocker: resolu.referenceDocker,
      },
    });
    const resultat: CreateContainerResult = {
      id: container.id,
      warnings: [],
      ...(ipReseauInterne !== undefined ? { ipReseauInterne } : {}),
    };
    void deps.journauxFichierConteneur
      ?.notifierCreation(resultat.id, {
        referenceDockerEffective: resolu.referenceDocker,
        idCatalogueImage:
          resolu.mode === "catalogue" ? resolu.idCatalogue : undefined,
        nomConteneur: spec.name,
        hostname: spec.hostname,
        idRequete: requestId,
      })
      .catch(() => {});
    return resultat;
  } catch (e) {
    wrapDockerError(e);
  }
}
