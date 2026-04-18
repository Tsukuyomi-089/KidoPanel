let requetesTotal = 0;
let erreurs5xx = 0;

export function incrementerRequeteWebService(): void {
  requetesTotal += 1;
}

export function incrementerErreur5xxWebService(): void {
  erreurs5xx += 1;
}

export function lireMetriquesWebServiceBrut(): {
  requetesTotal: number;
  erreurs5xx: number;
} {
  return { requetesTotal, erreurs5xx };
}
