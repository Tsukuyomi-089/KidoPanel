const LONGUEUR_MIN = 8;
const LONGUEUR_MAX = 128;

/**
 * Vérifie la robustesse du mot de passe côté interface (complément au minimum serveur).
 * Retourne un message en français si la politique n’est pas respectée, sinon null.
 */
export function messagePolitiqueMotDePasseInscription(
  motDePasse: string,
): string | null {
  if (motDePasse.length < LONGUEUR_MIN) {
    return `Le mot de passe doit contenir au moins ${String(LONGUEUR_MIN)} caractères.`;
  }
  if (motDePasse.length > LONGUEUR_MAX) {
    return `Le mot de passe ne peut pas dépasser ${String(LONGUEUR_MAX)} caractères.`;
  }
  if (!/[a-zà-ÿ]/.test(motDePasse)) {
    return "Ajoutez au moins une lettre minuscule.";
  }
  if (!/[A-ZÀ-Ÿ]/.test(motDePasse)) {
    return "Ajoutez au moins une lettre majuscule.";
  }
  if (!/\d/.test(motDePasse)) {
    return "Ajoutez au moins un chiffre.";
  }
  if (!/[^A-Za-zÀ-ÿ0-9]/.test(motDePasse)) {
    return "Ajoutez au moins un symbole (ponctuation ou caractère spécial).";
  }
  return null;
}
