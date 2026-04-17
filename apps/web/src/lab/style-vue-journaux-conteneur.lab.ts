import type { CSSProperties } from "react";

/** Zone de lecture des journaux conteneur, proche d’une console sombre type Portainer. */
export const styleVueJournauxConteneurLab: CSSProperties = {
  marginTop: "0.5rem",
  minHeight: "min(50vh, 420px)",
  maxHeight: "min(65vh, 560px)",
  overflow: "auto",
  background: "#0e0e0e",
  color: "#c8c8c8",
  padding: "0.65rem 0.75rem",
  fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  lineHeight: 1.45,
  borderRadius: 4,
  border: "1px solid #2a2a2a",
};
