import { ContainerEngineError } from "../errors.js";

/**
 * Détecte la réponse Docker / dockerode « conteneur déjà arrêté » sur un `stop`
 * (statut HTTP 304 ou libellé d’erreur équivalent).
 * L’état cible (hors exécution) est déjà satisfait : l’opération peut être traitée comme un succès idempotent.
 */
export function estErreurArretConteneurDejaArrete(err: unknown): boolean {
  if (err && typeof err === "object" && "statusCode" in err) {
    const sc = (err as { statusCode?: number }).statusCode;
    if (sc === 304) {
      return true;
    }
  }
  if (err instanceof Error) {
    return /already stopped/i.test(err.message);
  }
  return false;
}

/** Indique si l’erreur porte un code système Node (`errno`). */
function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}

/**
 * Rejette toujours : convertit les erreurs Docker ou réseau en `ContainerEngineError` typées.
 */
export function wrapDockerError(err: unknown): never {
  if (isErrnoException(err)) {
    if (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOENT" ||
      err.code === "ENOTFOUND"
    ) {
      throw new ContainerEngineError(
        "DOCKER_UNAVAILABLE",
        "Impossible de joindre Docker Engine (vérifier DOCKER_HOST et les droits sur le socket).",
        { cause: err },
      );
    }
  }
  if (err && typeof err === "object" && "statusCode" in err) {
    const sc = (err as { statusCode?: number }).statusCode;
    const msg = err instanceof Error ? err.message : String(err);
    if (sc === 404) {
      throw new ContainerEngineError("NOT_FOUND", msg, { cause: err });
    }
    if (sc === 409) {
      throw new ContainerEngineError("CONFLICT", msg, { cause: err });
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  throw new ContainerEngineError("OPERATION_FAILED", msg, { cause: err });
}
