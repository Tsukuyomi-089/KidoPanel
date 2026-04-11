import type { CSSProperties } from "react";

/** Encadré standard des sections de l’interface de test. */
export const styleBlocLab: CSSProperties = {
  marginBottom: "1.25rem",
  padding: "0.75rem",
  border: "1px solid #444",
  borderRadius: 6,
  maxWidth: 900,
};

/** Bloc de texte monospace pour erreurs et journaux. */
export const stylePreLab: CSSProperties = {
  marginTop: "0.5rem",
  maxHeight: 220,
  overflow: "auto",
  background: "#1a1a1a",
  color: "#e0e0e0",
  padding: "0.5rem",
  fontSize: 12,
  borderRadius: 4,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
