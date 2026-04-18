import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import type { UserRepository } from "./user-repository.prisma.js";
import { versUtilisateurPublic } from "./user.repository.js";
import type {
  RoleUtilisateurKidoPanel,
  UtilisateurPublic,
  UtilisateurStocke,
} from "./user.types.js";

export type ResultatAuth = {
  jeton: string;
  utilisateur: UtilisateurPublic;
};

type ParametresServiceAuth = {
  userRepository: UserRepository;
  secretJwt: Uint8Array;
  expirationSecondes: number;
  coutBcrypt: number;
};

function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

function ligneVersStocke(ligne: {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  role: RoleUtilisateurKidoPanel;
}): UtilisateurStocke {
  return {
    id: ligne.id,
    emailNormalise: ligne.email,
    hashMotDePasse: ligne.password,
    creeLeIso: ligne.createdAt.toISOString(),
    role: ligne.role,
  };
}

/** Orchestre inscription, vérification des identifiants et émission des JWT. */
export class ServiceAuth {
  constructor(private readonly params: ParametresServiceAuth) {}

  async inscrire(
    emailBrut: string,
    motDePasse: string,
  ): Promise<ResultatAuth> {
    const emailNormalise = normaliserEmail(emailBrut);
    const existant =
      await this.params.userRepository.findByEmail(emailNormalise);
    if (existant) {
      throw new Error("EMAIL_DEJA_UTILISE");
    }
    const hashMotDePasse = await bcrypt.hash(
      motDePasse,
      this.params.coutBcrypt,
    );
    const id = randomUUID();
    const nombreComptesExistants =
      await this.params.userRepository.compter();
    const cree = await this.params.userRepository.create({
      id,
      email: emailNormalise,
      password: hashMotDePasse,
      ...(nombreComptesExistants === 0 ? { role: "ADMIN" as const } : {}),
    });
    const stocke = ligneVersStocke(cree);
    const publicU = versUtilisateurPublic(stocke);
    const jeton = await this.signerJeton(publicU);
    return { jeton, utilisateur: publicU };
  }

  async connecter(
    emailBrut: string,
    motDePasse: string,
  ): Promise<ResultatAuth> {
    const emailNormalise = normaliserEmail(emailBrut);
    const ligne = await this.params.userRepository.findByEmail(emailNormalise);
    if (!ligne) {
      throw new Error("IDENTIFIANTS_INVALIDES");
    }
    const stocke = ligneVersStocke(ligne);
    const ok = await bcrypt.compare(motDePasse, stocke.hashMotDePasse);
    if (!ok) {
      throw new Error("IDENTIFIANTS_INVALIDES");
    }
    const publicU = versUtilisateurPublic(stocke);
    const jeton = await this.signerJeton(publicU);
    return { jeton, utilisateur: publicU };
  }

  private async signerJeton(utilisateur: UtilisateurPublic): Promise<string> {
    return new SignJWT({
      email: utilisateur.email,
      role: utilisateur.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(utilisateur.id)
      .setIssuedAt()
      .setExpirationTime(`${String(this.params.expirationSecondes)}s`)
      .sign(this.params.secretJwt);
  }
}
