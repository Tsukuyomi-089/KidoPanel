import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import type { DepotUtilisateur } from "./user.repository.js";
import { versUtilisateurPublic } from "./user.repository.js";
import type { UtilisateurPublic, UtilisateurStocke } from "./user.types.js";

export type ResultatAuth = {
  jeton: string;
  utilisateur: UtilisateurPublic;
};

type ParametresServiceAuth = {
  depotUtilisateur: DepotUtilisateur;
  secretJwt: Uint8Array;
  expirationSecondes: number;
  coutBcrypt: number;
};

function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Orchestre inscription, vérification des identifiants et émission des JWT. */
export class ServiceAuth {
  constructor(private readonly params: ParametresServiceAuth) {}

  async inscrire(
    emailBrut: string,
    motDePasse: string,
  ): Promise<ResultatAuth> {
    const emailNormalise = normaliserEmail(emailBrut);
    if (this.params.depotUtilisateur.emailExiste(emailNormalise)) {
      throw new Error("EMAIL_DEJA_UTILISE");
    }
    const hashMotDePasse = await bcrypt.hash(
      motDePasse,
      this.params.coutBcrypt,
    );
    const stocke: UtilisateurStocke = {
      id: randomUUID(),
      emailNormalise,
      hashMotDePasse,
      creeLeIso: new Date().toISOString(),
    };
    this.params.depotUtilisateur.creer(stocke);
    const publicU = versUtilisateurPublic(stocke);
    const jeton = await this.signerJeton(publicU);
    return { jeton, utilisateur: publicU };
  }

  async connecter(
    emailBrut: string,
    motDePasse: string,
  ): Promise<ResultatAuth> {
    const emailNormalise = normaliserEmail(emailBrut);
    const stocke = this.params.depotUtilisateur.trouverParEmail(emailNormalise);
    if (!stocke) {
      throw new Error("IDENTIFIANTS_INVALIDES");
    }
    const ok = await bcrypt.compare(motDePasse, stocke.hashMotDePasse);
    if (!ok) {
      throw new Error("IDENTIFIANTS_INVALIDES");
    }
    const publicU = versUtilisateurPublic(stocke);
    const jeton = await this.signerJeton(publicU);
    return { jeton, utilisateur: publicU };
  }

  private async signerJeton(utilisateur: UtilisateurPublic): Promise<string> {
    return new SignJWT({ email: utilisateur.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(utilisateur.id)
      .setIssuedAt()
      .setExpirationTime(`${String(this.params.expirationSecondes)}s`)
      .sign(this.params.secretJwt);
  }
}
