import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import {
  styleChampTexteCreation,
  styleLabelChampCreation,
} from "./stylesFormulaireCreationConteneurLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
};

/**
 * Options d’hôte fréquentes dans Portainer : IPC, PID, runtime, mémoire avancée, cgroup, volumesFrom.
 */
export function BlocHoteRuntimeEtMemoireCreationConteneurLab({
  etat,
  majEtat,
}: Props) {
  return (
    <details style={{ marginBottom: 10 }}>
      <summary>Hôte, runtime et mémoire (aligné API Docker)</summary>
      <label style={styleLabelChampCreation}>
        Recherche DNS (suffixes, virgules)
        <input
          value={etat.rechercheDns}
          onChange={(e) => majEtat({ rechercheDns: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Options DNS (valeurs brutes moteur, virgules)
        <input
          value={etat.optionsDns}
          onChange={(e) => majEtat({ optionsDns: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Mode IPC (ex. shareable, host)
        <input
          value={etat.modeIpc}
          onChange={(e) => majEtat({ modeIpc: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Mode PID (ex. host)
        <input
          value={etat.modePid}
          onChange={(e) => majEtat({ modePid: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Mode UTS (ex. host)
        <input
          value={etat.modeUts}
          onChange={(e) => majEtat({ modeUts: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Mode user namespace
        <input
          value={etat.modeUserns}
          onChange={(e) => majEtat({ modeUserns: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Cgroupns du conteneur
        <select
          value={etat.cgroupnsMode}
          onChange={(e) =>
            majEtat({
              cgroupnsMode: e.target.value as EtatCreationConteneurLab["cgroupnsMode"],
            })
          }
          style={styleChampTexteCreation}
        >
          <option value="">(défaut moteur)</option>
          <option value="private">private</option>
          <option value="host">host</option>
        </select>
      </label>
      <label style={styleLabelChampCreation}>
        Runtime OCI (ex. runc)
        <input
          value={etat.runtimeConteneur}
          onChange={(e) => majEtat({ runtimeConteneur: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Mémoire réservée (Mo, entier)
        <input
          value={etat.memoireReservationMegaOctets}
          onChange={(e) => majEtat({ memoireReservationMegaOctets: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Limite swap totale (Mo, entier, -1 = illimité)
        <input
          value={etat.memoireSwapMegaOctets}
          onChange={(e) => majEtat({ memoireSwapMegaOctets: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Swappiness (-1 à 100, vide = défaut)
        <input
          value={etat.swappiness}
          onChange={(e) => majEtat({ swappiness: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={etat.oomKillDesactive}
          onChange={(e) => majEtat({ oomKillDesactive: e.target.checked })}
        />
        Désactiver le tueur OOM
      </label>
      <label style={styleLabelChampCreation}>
        Ajustement score OOM (-1000 à 1000)
        <input
          value={etat.oomScoreAdj}
          onChange={(e) => majEtat({ oomScoreAdj: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Pondération blkio (10 à 1000)
        <input
          value={etat.blkioWeight}
          onChange={(e) => majEtat({ blkioWeight: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Groupe cgroup parent
        <input
          value={etat.cgroupParent}
          onChange={(e) => majEtat({ cgroupParent: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Pilote de volume par défaut
        <input
          value={etat.piloteVolume}
          onChange={(e) => majEtat({ piloteVolume: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        VolumesFrom (une entrée par ligne)
        <textarea
          value={etat.volumesFromLignes}
          onChange={(e) => majEtat({ volumesFromLignes: e.target.value })}
          rows={3}
          style={{ ...styleChampTexteCreation, minHeight: "3rem" }}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Règles cgroup périphériques (une par ligne)
        <textarea
          value={etat.deviceCgroupRulesLignes}
          onChange={(e) => majEtat({ deviceCgroupRulesLignes: e.target.value })}
          rows={3}
          style={{ ...styleChampTexteCreation, minHeight: "3rem" }}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Console : hauteur (lignes)
        <input
          value={etat.consoleHauteur}
          onChange={(e) => majEtat({ consoleHauteur: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        Console : largeur (colonnes)
        <input
          value={etat.consoleLargeur}
          onChange={(e) => majEtat({ consoleLargeur: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
    </details>
  );
}
