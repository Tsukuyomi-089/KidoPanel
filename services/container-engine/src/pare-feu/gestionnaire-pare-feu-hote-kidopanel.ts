import type { DockerClient } from "../docker-connection.js";
import { journaliserMoteur } from "../observabilite/journal-json.js";
import { extrairePublicationsHoteNonLoopbackDepuisInspection } from "./extraire-publications-hote-depuis-inspection-docker.js";
import {
  fermerPortFirewalldHote,
  ouvrirPortFirewalldHote,
  testerFirewalldActifSurHote,
} from "./executer-firewalld-hote.js";
import {
  RepositoryEtatPareFeuHoteKidopanel,
  resoudreCheminFichierEtatPareFeuDepuisEnv,
} from "./repository-etat-pare-feu-hote-kidopanel.js";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

function clePublication(p: PublicationHotePareFeu): string {
  return `${p.protocole}:${String(p.numero)}`;
}

function pareFeuAutomatiqueActiveDepuisEnv(): boolean {
  return process.env.CONTAINER_ENGINE_PAREFEU_AUTO?.trim() !== "0";
}

/**
 * Orchestre l’ouverture et la fermeture des ports sur firewalld pour les publications Docker réelles,
 * avec persistance pour la désinstallation globale du panel.
 */
export class GestionnairePareFeuHoteKidopanel {
  private pareFeuDetecte: boolean | undefined;

  constructor(private readonly depot: RepositoryEtatPareFeuHoteKidopanel) {}

  /** Instance par défaut : état JSON sous `donnees/` ou chemin imposé par l’environnement. */
  static creerDepuisEnv(): GestionnairePareFeuHoteKidopanel {
    return new GestionnairePareFeuHoteKidopanel(
      new RepositoryEtatPareFeuHoteKidopanel(resoudreCheminFichierEtatPareFeuDepuisEnv()),
    );
  }

  private async assurerPareFeuDisponible(requestId?: string): Promise<boolean> {
    if (this.pareFeuDetecte !== undefined) {
      return this.pareFeuDetecte;
    }
    const actif = await testerFirewalldActifSurHote();
    this.pareFeuDetecte = actif;
    if (!actif) {
      journaliserMoteur({
        niveau: "info",
        message: "pare_feu_hote_firewalld_indisponible_ou_inactif",
        requestId,
        metadata: {
          note: "Ports conteneur non ouverts automatiquement ; configurez firewalld ou sudo NOPASSWD.",
        },
      });
    }
    return actif;
  }

  /**
   * Après démarrage Docker : ouvre les ports hôte publiés (hors loopback) et met à jour le fichier d’état.
   */
  async apresDemarrageConteneur(
    idConteneur: string,
    docker: DockerClient,
    options?: { requestId?: string },
  ): Promise<void> {
    if (!pareFeuAutomatiqueActiveDepuisEnv()) {
      return;
    }
    if (!(await this.assurerPareFeuDisponible(options?.requestId))) {
      return;
    }

    let inspection;
    try {
      inspection = await docker.getContainer(idConteneur).inspect();
    } catch {
      return;
    }

    const publications = extrairePublicationsHoteNonLoopbackDepuisInspection(inspection);
    const idCanonique = inspection.Id;

    const existante = await this.depot.trouverEntreePourIdConteneur(idCanonique);
    const anciennesList = existante?.entree.ports ?? [];

    const cleAnc = new Set(anciennesList.map(clePublication));
    const cleNouv = new Set(publications.map(clePublication));

    for (const ancienne of anciennesList) {
      if (!cleNouv.has(clePublication(ancienne))) {
        const res = await fermerPortFirewalldHote(ancienne);
        if (!res.ok) {
          journaliserMoteur({
            niveau: "warn",
            message: "pare_feu_hote_fermeture_port_echec",
            requestId: options?.requestId,
            metadata: {
              port: ancienne.numero,
              protocole: ancienne.protocole,
              erreur: res.messageErreur,
            },
          });
        }
      }
    }

    for (const pub of publications) {
      if (!cleAnc.has(clePublication(pub))) {
        const res = await ouvrirPortFirewalldHote(pub);
        if (!res.ok) {
          journaliserMoteur({
            niveau: "warn",
            message: "pare_feu_hote_ouverture_port_echec",
            requestId: options?.requestId,
            metadata: {
              port: pub.numero,
              protocole: pub.protocole,
              erreur: res.messageErreur,
            },
          });
        } else {
          journaliserMoteur({
            niveau: "info",
            message: "pare_feu_hote_port_ouvert",
            requestId: options?.requestId,
            metadata: {
              idConteneurDocker: idCanonique,
              port: pub.numero,
              protocole: pub.protocole,
            },
          });
        }
      }
    }

    if (publications.length > 0) {
      await this.depot.remplacerEntreeConteneur(idCanonique, publications);
    } else {
      await this.depot.retirerEntreePourIdConteneur(idCanonique);
    }
  }

  /**
   * Avant suppression du conteneur : retire les règles pare-feu enregistrées pour cet identifiant.
   */
  async avantSuppressionConteneur(
    idConteneur: string,
    options?: { requestId?: string },
  ): Promise<void> {
    if (!pareFeuAutomatiqueActiveDepuisEnv()) {
      return;
    }
    if (!(await this.assurerPareFeuDisponible(options?.requestId))) {
      await this.depot.retirerEntreePourIdConteneur(idConteneur);
      return;
    }

    const ports = await this.depot.retirerEntreePourIdConteneur(idConteneur);
    for (const pub of ports) {
      const res = await fermerPortFirewalldHote(pub);
      if (!res.ok) {
        journaliserMoteur({
          niveau: "warn",
          message: "pare_feu_hote_fermeture_port_echec",
          requestId: options?.requestId,
          metadata: {
            port: pub.numero,
            protocole: pub.protocole,
            erreur: res.messageErreur,
          },
        });
      }
    }
  }
}

/**
 * Fabrique un gestionnaire si la variable d’environnement n’a pas désactivé la fonctionnalité.
 */
export function creerGestionnairePareFeuHoteKidopanelDepuisEnv():
  | GestionnairePareFeuHoteKidopanel
  | undefined {
  if (!pareFeuAutomatiqueActiveDepuisEnv()) {
    return undefined;
  }
  return GestionnairePareFeuHoteKidopanel.creerDepuisEnv();
}
