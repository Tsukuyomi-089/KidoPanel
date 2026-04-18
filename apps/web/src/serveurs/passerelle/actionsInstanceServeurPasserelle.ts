import {
  arreterInstanceServeurJeuxPasserelle,
  demarrerInstanceServeurJeuxPasserelle,
  redemarrerInstanceServeurJeuxPasserelle,
  supprimerInstanceServeurJeuxPasserelle,
} from "../../passerelle/serviceServeursJeuxPasserelle.js";

/** Démarre une instance jeu via la passerelle. */
export async function demarrerInstanceServeur(id: string): Promise<void> {
  await demarrerInstanceServeurJeuxPasserelle(id);
}

/** Arrête une instance jeu via la passerelle. */
export async function arreterInstanceServeur(id: string): Promise<void> {
  await arreterInstanceServeurJeuxPasserelle(id);
}

/** Redémarre une instance jeu via la passerelle. */
export async function redemarrerInstanceServeur(id: string): Promise<void> {
  await redemarrerInstanceServeurJeuxPasserelle(id);
}

/** Supprime une instance jeu via la passerelle (action irréversible côté service). */
export async function supprimerInstanceServeur(id: string): Promise<void> {
  await supprimerInstanceServeurJeuxPasserelle(id);
}
