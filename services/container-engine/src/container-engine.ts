import type {
  ContainerInspectInfo,
  ContainerInfo,
} from "dockerode";
import {
  type CreateContainerResult,
  type ContainerCreateSpec,
  type ContainerStatus,
  type ContainerSummary,
} from "./types.js";
import { isContainerEngineError } from "./errors.js";
import {
  createDockerClient,
  type DockerClient,
  type DockerConnectionOptions,
} from "./docker-connection.js";
import { executerTirageImageDocker } from "./docker/image.service.js";
import {
  estErreurArretConteneurDejaArrete,
  wrapDockerError,
} from "./docker/wrap-docker-operation.js";
import {
  lireJournauxConteneur,
  ouvrirFluxSuiviJournaux,
  type FluxSuiviJournaux,
} from "./container-engine-logs.js";
import { traduireOptionsCreationConteneur } from "./docker/traduction-options-creation-conteneur.js";
import { creerServiceTirageImageCatalogue } from "./image-puller.service.js";
import { validerImageCatalogueAvantCreation } from "./image-validator.service.js";
import type { ServiceTirageImageCatalogue } from "./image-puller.service.js";
import { journaliserMoteur } from "./observabilite/journal-json.js";

/** Normalise l’état brut Docker vers le type `ContainerStatus` du domaine. */
function mapDockerState(state: string | undefined): ContainerStatus {
  switch (state) {
    case "created":
    case "running":
    case "paused":
    case "restarting":
    case "removing":
    case "exited":
    case "dead":
      return state;
    default:
      return "unknown";
  }
}

/** Transforme une entrée de `listContainers` Docker en résumé métier. */
function mapListItem(c: ContainerInfo): ContainerSummary {
  const ports =
    c.Ports?.map((p) => ({
      privatePort: p.PrivatePort,
      publicPort: p.PublicPort,
      type: p.Type,
      ip: p.IP,
    })) ?? [];

  return {
    id: c.Id,
    names: c.Names ?? [],
    image: c.Image,
    imageId: c.ImageID,
    command: c.Command,
    created: c.Created,
    status: c.Status,
    state: mapDockerState(c.State),
    labels: c.Labels ?? {},
    ports,
  };
}

/** Options du constructeur : client injecté ou paramètres de connexion explicites. */
export interface ContainerEngineOptions {
  docker?: DockerClient;
  connection?: DockerConnectionOptions;
}

/**
 * Façade sur Docker Engine : création, démarrage, arrêt, suppression, liste,
 * inspection, tirage d’image catalogue et lecture des journaux.
 */
export class ContainerEngine {
  private readonly docker: DockerClient;
  private readonly serviceTirageCatalogue: ServiceTirageImageCatalogue;

  constructor(options?: ContainerEngineOptions) {
    if (options?.docker) {
      this.docker = options.docker;
    } else {
      this.docker = createDockerClient(options?.connection);
    }
    this.serviceTirageCatalogue = creerServiceTirageImageCatalogue(this.docker);
  }

  /** Indique si le démon répond au ping. */
  async ping(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch (e) {
      wrapDockerError(e);
    }
  }

  async listContainers(all = false): Promise<ContainerSummary[]> {
    try {
      const list = await this.docker.listContainers({ all });
      return list.map(mapListItem);
    } catch (e) {
      wrapDockerError(e);
    }
  }

  async inspectContainer(id: string): Promise<ContainerInspectInfo> {
    try {
      const container = this.docker.getContainer(id);
      return await container.inspect();
    } catch (e) {
      wrapDockerError(e);
    }
  }

  /**
   * Crée un conteneur : validation catalogue, tirage contrôlé si l’image manque localement,
   * puis appel Docker avec la référence résolue.
   */
  async createContainer(
    spec: ContainerCreateSpec,
    options?: { requestId?: string },
  ): Promise<CreateContainerResult> {
    const requestId = options?.requestId;
    const entree = validerImageCatalogueAvantCreation(spec.imageCatalogId, requestId);
    await this.serviceTirageCatalogue.garantirImageCatalogueSurHote(entree, requestId);

    const opts = traduireOptionsCreationConteneur(spec, entree.referenceDocker);

    try {
      const container = await this.docker.createContainer(opts);
      journaliserMoteur({
        niveau: "info",
        message: "creation_conteneur_catalogue_terminee",
        requestId,
        metadata: {
          idConteneur: container.id,
          idCatalogue: entree.id,
          referenceDocker: entree.referenceDocker,
        },
      });
      return {
        id: container.id,
        warnings: [],
      };
    } catch (e) {
      wrapDockerError(e);
    }
  }

  async startContainer(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.start();
    } catch (e) {
      wrapDockerError(e);
    }
  }

  async stopContainer(id: string, timeoutSeconds = 10): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.stop({ t: timeoutSeconds });
    } catch (e) {
      if (estErreurArretConteneurDejaArrete(e)) {
        return;
      }
      wrapDockerError(e);
    }
  }

  async removeContainer(id: string, options?: { force?: boolean }): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.remove({ force: options?.force });
    } catch (e) {
      wrapDockerError(e);
    }
  }

  /**
   * Force le tirage d’une image catalogue depuis le registre (même si une couche locale existe).
   */
  async pullImage(
    imageCatalogId: string,
    options?: { requestId?: string },
  ): Promise<void> {
    const entree = validerImageCatalogueAvantCreation(imageCatalogId, options?.requestId);
    const requestId = options?.requestId;
    const ref = entree.referenceDocker;
    journaliserMoteur({
      niveau: "info",
      message: "image_pull_start",
      requestId,
      metadata: {
        idCatalogue: entree.id,
        referenceDocker: ref,
        mode: "pull_force",
      },
    });
    try {
      await executerTirageImageDocker(this.docker, ref);
    } catch (err) {
      journaliserMoteur({
        niveau: "error",
        message: "image_pull_failed",
        requestId,
        metadata: {
          idCatalogue: entree.id,
          referenceDocker: ref,
          codeErreur: isContainerEngineError(err) ? err.code : "inconnu",
          mode: "pull_force",
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
        mode: "pull_force",
      },
    });
  }

  /**
   * Retourne les journaux concaténés (stdout et stderr) pour une réponse JSON ponctuelle.
   */
  async getLogs(
    id: string,
    options?: { tail?: number; timestamps?: boolean },
  ): Promise<string> {
    return lireJournauxConteneur(this.docker, id, options);
  }

  /**
   * Ouvre un flux Docker en suivi continu (`follow`) pour exposition SSE ou proxy HTTP.
   */
  openLogFollowStream(
    id: string,
    options?: { tail?: number; timestamps?: boolean },
  ): Promise<FluxSuiviJournaux> {
    return ouvrirFluxSuiviJournaux(this.docker, id, options);
  }

  /** Accès bas niveau au client Docker pour les cas avancés. */
  get raw(): DockerClient {
    return this.docker;
  }
}
