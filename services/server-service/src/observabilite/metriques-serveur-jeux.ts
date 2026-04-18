let requetesTotal = 0;
let erreurs5xx = 0;

/** Compteur global des requêtes HTTP traitées par le service. */
export function incrementerRequetesServeurJeux(): void {
  requetesTotal += 1;
}

/** Compteur des réponses HTTP en erreur serveur pour observabilité type Prometheus minimal. */
export function incrementerErreursServeurJeux(): void {
  erreurs5xx += 1;
}

/** Valeurs brutes exposées par `GET /metrics`. */
export function lireMetriquesServeurJeuxBrut(): {
  requetesTotal: number;
  erreurs5xx: number;
} {
  return { requetesTotal, erreurs5xx };
}
