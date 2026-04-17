import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import {
  styleChampTexteCreation,
  styleLabelChampCreation,
} from "./stylesFormulaireCreationConteneurLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
};

/** Champs de la ressource de création Docker hors `hostConfig` (plateforme, délais, attachements flux). */
export function BlocOptionsMoteurDockerCreationConteneurLab({
  etat,
  majEtat,
}: Props) {
  return (
    <details style={{ marginBottom: 10 }}>
      <summary>Options moteur Docker (hors hostConfig)</summary>
      <label style={styleLabelChampCreation}>
        Plateforme (ex. linux/amd64)
        <input
          value={etat.platformeDocker}
          onChange={(e) => majEtat({ platformeDocker: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Délai d’arrêt (secondes, 0–3600)
        <input
          value={etat.delaiArretSecondes}
          onChange={(e) => majEtat({ delaiArretSecondes: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={etat.desactiverReseauConteneur}
          onChange={(e) => majEtat({ desactiverReseauConteneur: e.target.checked })}
        />
        Réseau du conteneur désactivé
      </label>
      <p style={{ fontSize: "0.82rem", opacity: 0.85, margin: "6px 0" }}>
        Attachement des flux standard (champs `AttachStdin` / `AttachStdout` / `AttachStderr` / `StdinOnce` de
        l’API Docker) :
      </p>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={etat.attacherStdin}
          onChange={(e) => majEtat({ attacherStdin: e.target.checked })}
        />
        Attacher le flux stdin
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={etat.attacherStdout}
          onChange={(e) => majEtat({ attacherStdout: e.target.checked })}
        />
        Attacher le flux stdout
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={etat.attacherStderr}
          onChange={(e) => majEtat({ attacherStderr: e.target.checked })}
        />
        Attacher le flux stderr
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={etat.stdinUneFois}
          onChange={(e) => majEtat({ stdinUneFois: e.target.checked })}
        />
        Fermer stdin après une attache unique
      </label>
    </details>
  );
}
