type EvenementSseParse = {
  typeEvenement?: string;
  donnees: string;
};

/**
 * Découpe un tampon texte SSE en paquets complets (séparateur double saut de ligne).
 */
export function extraireEvenementsSseDepuisTampon(tampon: string): {
  tamponRestant: string;
  evenements: EvenementSseParse[];
} {
  const evenements: EvenementSseParse[] = [];
  const paquets = tampon.split(/\r?\n\r?\n/);
  const tamponRestant = paquets.pop() ?? "";
  for (const paquet of paquets) {
    let typeEvenement: string | undefined;
    const lignesData: string[] = [];
    for (const ligne of paquet.split(/\r?\n/)) {
      if (ligne.startsWith("event:")) {
        typeEvenement = ligne.slice(6).trim();
      } else if (ligne.startsWith("data:")) {
        lignesData.push(ligne.slice(5).trimStart());
      }
    }
    if (lignesData.length > 0) {
      evenements.push({
        typeEvenement,
        donnees: lignesData.join("\n"),
      });
    }
  }
  return { tamponRestant, evenements };
}
