import type { CSSProperties } from "react";

/** Style commun des libellés du formulaire de création (laboratoire). */
export const styleLabelChampCreation: CSSProperties = {
  display: "block",
  maxWidth: 720,
  marginBottom: 10,
};

/** Style commun des champs texte du formulaire de création (laboratoire). */
export const styleChampTexteCreation: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.85rem",
};

/** Texte d’aide sous un libellé (définition du champ, laboratoire création conteneur). */
export const styleAideChampCreation: CSSProperties = {
  fontSize: "0.78rem",
  lineHeight: 1.4,
  opacity: 0.88,
  marginTop: 2,
  marginBottom: 6,
  maxWidth: 720,
  fontWeight: 400,
};

/** Titre visible au-dessus de l’aide et du champ (libellé fort). */
export const styleTitreChampCreation: CSSProperties = {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: 600,
  marginBottom: 2,
};
