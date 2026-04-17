import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import {
  AIDE_ADRESSE_MAC,
  AIDE_CMD,
  AIDE_DOMAINNAME,
  AIDE_ENTRYPOINT,
  AIDE_HOSTNAME_CONTENEUR,
  AIDE_IMAGE_REFERENCE,
  AIDE_NOM_CONTENEUR,
  AIDE_REPERTOIRE_TRAVAIL,
  AIDE_SIGNAL_ARRET,
  AIDE_UTILISATEUR_PROCESSUS,
} from "./definitionsAidesCreationConteneurLab.js";
import {
  styleChampTexteCreation,
  styleLabelChampCreation,
  styleTitreChampCreation,
} from "./stylesFormulaireCreationConteneurLab.js";
import { TexteAideChampCreationConteneurLab } from "./TexteAideChampCreationConteneurLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
};

/** Identité de l’image, nom du conteneur, commande, entrypoint et identité processus. */
export function BlocIdentiteEtCommandeCreationConteneurLab({
  etat,
  majEtat,
}: Props) {
  return (
    <>
      <label style={styleLabelChampCreation}>
        <span style={styleTitreChampCreation}>Image Docker (obligatoire)</span>
        <TexteAideChampCreationConteneurLab texte={AIDE_IMAGE_REFERENCE} />
        <input
          value={etat.image}
          onChange={(e) => majEtat({ image: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>
      <label style={styleLabelChampCreation}>
        <span style={styleTitreChampCreation}>Nom du conteneur sur l’hôte</span>
        <TexteAideChampCreationConteneurLab texte={AIDE_NOM_CONTENEUR} />
        <input
          value={etat.nom}
          onChange={(e) => majEtat({ nom: e.target.value })}
          style={styleChampTexteCreation}
        />
      </label>

      <details style={{ marginBottom: 10 }}>
        <summary>Commande, point d’entrée et identité du processus</summary>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Arguments de commande (Cmd)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_CMD} />
          <textarea
            value={etat.cmdLignes}
            onChange={(e) => majEtat({ cmdLignes: e.target.value })}
            rows={4}
            style={{ ...styleChampTexteCreation, minHeight: "4.5rem" }}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Point d’entrée (Entrypoint)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_ENTRYPOINT} />
          <textarea
            value={etat.entrypointLignes}
            onChange={(e) => majEtat({ entrypointLignes: e.target.value })}
            rows={3}
            style={{ ...styleChampTexteCreation, minHeight: "3.2rem" }}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Répertoire de travail (WorkingDir)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_REPERTOIRE_TRAVAIL} />
          <input
            value={etat.repertoireTravail}
            onChange={(e) => majEtat({ repertoireTravail: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Utilisateur du processus principal (User)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_UTILISATEUR_PROCESSUS} />
          <input
            value={etat.utilisateur}
            onChange={(e) => majEtat({ utilisateur: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Nom d’hôte interne au conteneur (Hostname)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_HOSTNAME_CONTENEUR} />
          <input
            value={etat.nomHote}
            onChange={(e) => majEtat({ nomHote: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Domaine DNS du conteneur (Domainname)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_DOMAINNAME} />
          <input
            value={etat.domaineConteneur}
            onChange={(e) => majEtat({ domaineConteneur: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Adresse MAC de l’interface réseau (MacAddress)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_ADRESSE_MAC} />
          <input
            value={etat.adresseMac}
            onChange={(e) => majEtat({ adresseMac: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Signal d’arrêt propre (StopSignal)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_SIGNAL_ARRET} />
          <input
            value={etat.signalArret}
            onChange={(e) => majEtat({ signalArret: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
      </details>
    </>
  );
}
