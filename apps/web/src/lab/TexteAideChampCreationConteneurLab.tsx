import { styleAideChampCreation } from "./stylesFormulaireCreationConteneurLab.js";

type Props = {
  texte: string;
};

/** Paragraphe d’aide rattaché à un champ du formulaire de création (laboratoire). */
export function TexteAideChampCreationConteneurLab({ texte }: Props) {
  return <p style={styleAideChampCreation}>{texte}</p>;
}
