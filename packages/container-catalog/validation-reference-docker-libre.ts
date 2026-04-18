/** Longueur maximale alignée sur le corps JSON `POST /containers` côté moteur. */
const LONGUEUR_MAX_REFERENCE = 512;

/**
 * Contrôle qu’une chaîne peut être passée au moteur Docker pour tirage ou création,
 * sans interprétation du registre (Docker Hub, privé, digest).
 */
export function analyserReferenceDockerLibre(
  chaine: string,
):
  | { ok: true; valeurNormalisee: string }
  | { ok: false; message: string } {
  const valeurNormalisee = chaine.trim();
  if (valeurNormalisee.length === 0) {
    return {
      ok: false,
      message: "La référence d’image ne peut pas être vide.",
    };
  }
  if (valeurNormalisee.length > LONGUEUR_MAX_REFERENCE) {
    return {
      ok: false,
      message: `La référence dépasse ${LONGUEUR_MAX_REFERENCE} caractères.`,
    };
  }
  for (const caractere of valeurNormalisee) {
    const code = caractere.codePointAt(0);
    if (code === undefined || code < 0x20 || code === 0x7f) {
      return {
        ok: false,
        message: "La référence contient un caractère de contrôle interdit.",
      };
    }
    if (/\s/u.test(caractere)) {
      return {
        ok: false,
        message: "La référence d’image ne doit pas contenir d’espace.",
      };
    }
  }
  return { ok: true, valeurNormalisee };
}
