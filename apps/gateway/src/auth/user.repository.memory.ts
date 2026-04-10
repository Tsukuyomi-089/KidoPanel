import type { DepotUtilisateur } from "./user.repository.js";
import type { UtilisateurStocke } from "./user.types.js";

/** Stockage volatile en mémoire processus ; adapté au développement et aux tests. */
export class DepotUtilisateurMemoire implements DepotUtilisateur {
  private readonly parId = new Map<string, UtilisateurStocke>();
  private readonly parEmail = new Map<string, UtilisateurStocke>();

  creer(utilisateur: UtilisateurStocke): void {
    if (this.parEmail.has(utilisateur.emailNormalise)) {
      throw new Error("EMAIL_DEJA_UTILISE");
    }
    this.parId.set(utilisateur.id, utilisateur);
    this.parEmail.set(utilisateur.emailNormalise, utilisateur);
  }

  trouverParEmail(emailNormalise: string): UtilisateurStocke | undefined {
    return this.parEmail.get(emailNormalise);
  }

  trouverParId(id: string): UtilisateurStocke | undefined {
    return this.parId.get(id);
  }

  emailExiste(emailNormalise: string): boolean {
    return this.parEmail.has(emailNormalise);
  }
}
