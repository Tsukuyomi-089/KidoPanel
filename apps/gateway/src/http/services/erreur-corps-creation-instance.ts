/**
 * Corps de création rejeté avant relais moteur : identifiant de modèle inconnu ou JSON incohérent.
 */
export class ErreurCorpsCreationInstance extends Error {
  readonly codeMetier: string;

  constructor(codeMetier: string, message: string) {
    super(message);
    this.name = "ErreurCorpsCreationInstance";
    this.codeMetier = codeMetier;
  }
}
