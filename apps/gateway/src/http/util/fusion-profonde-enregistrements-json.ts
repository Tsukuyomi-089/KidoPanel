/**
 * Fusion récursive de deux enregistrements JSON plats : les sous-objets littéraux sont fusionnés,
 * les autres valeurs de `surcharge` remplacent celles de `base`.
 */
export function fusionProfondeEnregistrementsJson(
  base: Record<string, unknown>,
  surcharge: Record<string, unknown>,
): Record<string, unknown> {
  const sortie: Record<string, unknown> = { ...base };
  for (const [cle, valeur] of Object.entries(surcharge)) {
    const existant = sortie[cle];
    if (
      valeur !== null &&
      typeof valeur === "object" &&
      !Array.isArray(valeur) &&
      existant !== null &&
      typeof existant === "object" &&
      !Array.isArray(existant)
    ) {
      sortie[cle] = fusionProfondeEnregistrementsJson(
        existant as Record<string, unknown>,
        valeur as Record<string, unknown>,
      );
    } else {
      sortie[cle] = valeur;
    }
  }
  return sortie;
}
