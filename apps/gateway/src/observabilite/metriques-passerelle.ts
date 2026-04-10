/**
 * Compteurs en mémoire pour la charge et les incidents, exposés via GET /metrics sans dépendance externe.
 */

let requetesTotal = 0;
let erreurs = 0;
let fluxSseOuverts = 0;

export function incrementerRequetesPasserelle(): void {
  requetesTotal += 1;
}

export function incrementerErreursPasserelle(): void {
  erreurs += 1;
}

export function incrementerFluxSsePasserelle(): void {
  fluxSseOuverts += 1;
}

export function decrementerFluxSsePasserelle(): void {
  fluxSseOuverts = Math.max(0, fluxSseOuverts - 1);
}

export function lireMetriquesPasserelle(): {
  service: "gateway";
  requetesTotal: number;
  erreurs: number;
  fluxSseOuverts: number;
} {
  return {
    service: "gateway",
    requetesTotal,
    erreurs,
    fluxSseOuverts,
  };
}
