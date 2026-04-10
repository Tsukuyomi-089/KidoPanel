import type { DepotProprieteConteneur } from "./container-ownership.repository.js";

const LONGUEUR_PREFIXE_DOCKER = 12;

function prefixeDocker(id: string): string {
  const nettoye = id.trim().toLowerCase();
  return nettoye.slice(0, LONGUEUR_PREFIXE_DOCKER);
}

function memeConteneur(idA: string, idB: string): boolean {
  return prefixeDocker(idA) === prefixeDocker(idB);
}

/** Index propriétaire par identifiant Docker canonique (complet) stocké à la création. */
export class DepotProprieteConteneurMemoire implements DepotProprieteConteneur {
  private readonly proprietaireParIdComplet = new Map<string, string>();

  enregistrer(userId: string, idConteneurComplet: string): void {
    const cle = idConteneurComplet.trim();
    this.proprietaireParIdComplet.set(cle, userId);
  }

  estProprietaire(userId: string, idConteneurDocker: string): boolean {
    const direct = this.proprietaireParIdComplet.get(idConteneurDocker.trim());
    if (direct === userId) return true;
    for (const [idStocke, proprio] of this.proprietaireParIdComplet) {
      if (proprio === userId && memeConteneur(idStocke, idConteneurDocker)) {
        return true;
      }
    }
    return false;
  }

  retirerPourIdentifiant(idConteneurDocker: string): void {
    const cibles: string[] = [];
    for (const idStocke of this.proprietaireParIdComplet.keys()) {
      if (memeConteneur(idStocke, idConteneurDocker)) {
        cibles.push(idStocke);
      }
    }
    for (const c of cibles) {
      this.proprietaireParIdComplet.delete(c);
    }
  }
}
