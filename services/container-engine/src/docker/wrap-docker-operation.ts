import { ContainerEngineError } from "../errors.js";

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
