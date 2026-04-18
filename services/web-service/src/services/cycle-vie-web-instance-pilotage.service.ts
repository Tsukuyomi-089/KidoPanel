import type { WebInstance } from "@kidopanel/database";
import type { DepotWebInstance } from "../repositories/depot-web-instance.repository.js";
import type { DepotProprieteConteneur } from "../repositories/depot-propriete-conteneur.repository.js";
import type { ClientMoteurWebHttp } from "./client-moteur-web.service.js";
import { ErreurMetierWebInstance } from "../erreurs/erreurs-metier-web-instance.js";

type RoleInterne = "ADMIN" | "USER" | "VIEWER";

type ParamsDetailIdentiteWeb = {
  utilisateurId: string;
  role: RoleInterne;
  instanceId: string;
};

/**
 * Démarrage, arrêt, redémarrage et suppression d’instances web après contrôle d’accès.
 */
export class CycleVieWebInstancePilotage {
  constructor(
    private readonly obtenirDetailPourIdentiteInterne: (
      params: ParamsDetailIdentiteWeb,
    ) => Promise<WebInstance>,
    private readonly depot: DepotWebInstance,
    private readonly depotPropriete: DepotProprieteConteneur,
    private readonly clientMoteur: ClientMoteurWebHttp,
  ) {}

  async demarrer(params: {
    utilisateurId: string;
    role: RoleInterne;
    instanceId: string;
    identifiantRequeteHttp: string;
  }) {
    const ligne = await this.obtenirDetailPourIdentiteInterne({
      utilisateurId: params.utilisateurId,
      role: params.role,
      instanceId: params.instanceId,
    });
    if (params.role === "VIEWER") {
      throw new ErreurMetierWebInstance(
        "ROLE_LECTURE_SEULE_MUTATION_INTERDITE",
        "Action interdite pour le rôle observateur.",
        403,
      );
    }
    const idDocker = ligne.containerId?.trim();
    if (!idDocker) {
      throw new ErreurMetierWebInstance(
        "MOTEUR_CONTENEURS_ERREUR",
        "Aucun conteneur Docker associé.",
        409,
      );
    }
    await this.depot.mettreAJour(ligne.id, { status: "STARTING" });
    const dem = await this.clientMoteur.posterDemarrage(
      idDocker,
      params.identifiantRequeteHttp,
    );
    const texte = await dem.text();
    if (!dem.ok) {
      await this.depot.mettreAJour(ligne.id, { status: "ERROR" });
      throw new ErreurMetierWebInstance(
        "MOTEUR_CONTENEURS_ERREUR",
        texte.slice(0, 400),
        dem.status >= 400 && dem.status < 600 ? dem.status : 502,
      );
    }
    return this.depot.mettreAJour(ligne.id, { status: "RUNNING" });
  }

  async arreter(params: {
    utilisateurId: string;
    role: RoleInterne;
    instanceId: string;
    identifiantRequeteHttp: string;
  }) {
    const ligne = await this.obtenirDetailPourIdentiteInterne({
      utilisateurId: params.utilisateurId,
      role: params.role,
      instanceId: params.instanceId,
    });
    if (params.role === "VIEWER") {
      throw new ErreurMetierWebInstance(
        "ROLE_LECTURE_SEULE_MUTATION_INTERDITE",
        "Action interdite pour le rôle observateur.",
        403,
      );
    }
    const idDocker = ligne.containerId?.trim();
    if (!idDocker) {
      return this.depot.mettreAJour(ligne.id, { status: "STOPPED" });
    }
    await this.depot.mettreAJour(ligne.id, { status: "STOPPING" });
    const arret = await this.clientMoteur.posterArret(
      idDocker,
      params.identifiantRequeteHttp,
    );
    if (!arret.ok) {
      await this.depot.mettreAJour(ligne.id, { status: "ERROR" });
      throw new ErreurMetierWebInstance(
        "MOTEUR_CONTENEURS_ERREUR",
        "Arrêt refusé par le moteur.",
        arret.status >= 400 && arret.status < 600 ? arret.status : 502,
      );
    }
    return this.depot.mettreAJour(ligne.id, { status: "STOPPED" });
  }

  async redemarrer(params: {
    utilisateurId: string;
    role: RoleInterne;
    instanceId: string;
    identifiantRequeteHttp: string;
  }) {
    await this.arreter(params);
    return this.demarrer(params);
  }

  async supprimer(params: {
    utilisateurId: string;
    role: RoleInterne;
    instanceId: string;
    identifiantRequeteHttp: string;
  }) {
    const ligne = await this.obtenirDetailPourIdentiteInterne({
      utilisateurId: params.utilisateurId,
      role: params.role,
      instanceId: params.instanceId,
    });
    if (params.role === "VIEWER") {
      throw new ErreurMetierWebInstance(
        "ROLE_LECTURE_SEULE_MUTATION_INTERDITE",
        "Suppression interdite pour le rôle observateur.",
        403,
      );
    }
    const idDocker = ligne.containerId?.trim();
    if (idDocker) {
      await this.clientMoteur.supprimerConteneur(
        idDocker,
        params.identifiantRequeteHttp,
      );
      await this.depotPropriete.retirerProprieteUtilisateurPourConteneur(
        ligne.userId,
        idDocker,
      );
    }
    await this.depot.supprimer(ligne.id);
  }
}
