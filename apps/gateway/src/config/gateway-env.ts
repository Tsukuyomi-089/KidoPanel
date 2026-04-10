/**
 * Lecture centralisée des variables d’environnement de la passerelle
 * (URL du container-engine, limitation de débit, secrets JWT et coût bcrypt).
 */
export type GatewayEnv = {
  rateLimitMax: number;
  rateLimitWindowMs: number;
  /** Secret brut pour signature et vérification JWT (HS256). */
  jwtSecretBrut: string;
  /** Durée de vie des jetons d’accès émis à la connexion. */
  jwtExpiresSeconds: number;
  /** Coût bcrypt (facteur de travail) pour le hachage des mots de passe. */
  bcryptCost: number;
};

/** Retourne l’URL de base du container-engine, sans barre oblique finale. */
export function getContainerEngineBaseUrl(): string {
  const brut = process.env.CONTAINER_ENGINE_BASE_URL?.trim();
  const defaut = "http://127.0.0.1:8787";
  if (!brut) return defaut;
  return brut.replace(/\/+$/, "");
}

/** Encode le secret JWT pour les API `jose` (signature et vérification). */
export function encoderSecretJwt(env: GatewayEnv): Uint8Array {
  return new TextEncoder().encode(env.jwtSecretBrut);
}

/**
 * Construit la configuration complète à partir des variables d’environnement.
 * Sans `GATEWAY_JWT_SECRET`, la passerelle ne peut pas émettre ni valider les jetons : démarrage refusé.
 */
export function loadGatewayEnv(): GatewayEnv {
  const max = Number(process.env.GATEWAY_RATE_LIMIT_MAX ?? "120");
  const fenetreMs = Number(process.env.GATEWAY_RATE_LIMIT_WINDOW_MS ?? "60000");
  const jwtSecretBrut = process.env.GATEWAY_JWT_SECRET?.trim() ?? "";
  if (!jwtSecretBrut) {
    throw new Error(
      "Variable GATEWAY_JWT_SECRET manquante ou vide : obligatoire pour l’authentification.",
    );
  }
  const exp = Number(process.env.GATEWAY_JWT_EXPIRES_SECONDS ?? "86400");
  const bcryptCost = Number(process.env.GATEWAY_BCRYPT_COST ?? "12");
  return {
    rateLimitMax: Number.isFinite(max) && max > 0 ? max : 120,
    rateLimitWindowMs:
      Number.isFinite(fenetreMs) && fenetreMs > 0 ? fenetreMs : 60_000,
    jwtSecretBrut,
    jwtExpiresSeconds: Number.isFinite(exp) && exp > 0 ? exp : 86_400,
    bcryptCost:
      Number.isFinite(bcryptCost) && bcryptCost >= 4 && bcryptCost <= 15
        ? bcryptCost
        : 12,
  };
}
