/**
 * Compteurs en mémoire pour la charge du moteur HTTP, exposés via GET /metrics sans dépendance externe.
 */

let requetesTotal = 0;
let erreurs = 0;
let fluxSseOuverts = 0;

export function incrementerRequetesMoteur(): void {
  requetesTotal += 1;
}

export function incrementerErreursMoteur(): void {
  erreurs += 1;
}

export function incrementerFluxSseMoteur(): void {
  fluxSseOuverts += 1;
}

export function decrementerFluxSseMoteur(): void {
  fluxSseOuverts = Math.max(0, fluxSseOuverts - 1);
}

export function lireMetriquesMoteur(): {
  service: "container-engine";
  requetesTotal: number;
  erreurs: number;
  fluxSseOuverts: number;
} {
  return {
    service: "container-engine",
    requetesTotal,
    erreurs,
    fluxSseOuverts,
  };
}
