import { BlocIdentiteEtCommandeCreationConteneurLab } from "./BlocIdentiteEtCommandeCreationConteneurLab.js";
import { BlocHoteRuntimeEtMemoireCreationConteneurLab } from "./BlocHoteRuntimeEtMemoireCreationConteneurLab.js";
import { BlocOptionsMoteurDockerCreationConteneurLab } from "./BlocOptionsMoteurDockerCreationConteneurLab.js";
import { BlocReseauEtEnvironnementCreationConteneurLab } from "./BlocReseauEtEnvironnementCreationConteneurLab.js";
import { BlocSecuriteRessourcesEtJsonCreationConteneurLab } from "./BlocSecuriteRessourcesEtJsonCreationConteneurLab.js";
import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import { styleBlocLab } from "./stylesCommunsLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
  surCreer: () => void;
};

/** Formulaire avancé de création (image, commande, réseau, ressources, JSON santé / réseau / host). */
export function SectionCreationConteneurAvanceLab({
  etat,
  majEtat,
  surCreer,
}: Props) {
  return (
    <section style={styleBlocLab}>
      <h2 style={{ fontSize: "1rem", marginTop: 0 }}>
        Créer un conteneur (paramétrage type Portainer)
      </h2>
      <p style={{ fontSize: "0.88rem", opacity: 0.88, marginTop: 0 }}>
        Les champs structurés reprennent les options usuelles de Portainer (image, commande, réseau,
        ressources, runtime). Le moteur accepte en outre dans <code>hostConfig</code> toute clé
        supplémentaire au format de l’API Docker (souvent en tête PascalCase), comme le ferait le
        proxy <code>/docker/…</code> de Portainer. Liaisons de ports : une ligne{" "}
        <code>80/tcp=8080</code> ou <code>80/tcp=127.0.0.1:8080</code> ; variables et étiquettes en{" "}
        <code>CLE=VALEUR</code> par ligne. Les blocs JSON (santé, réseau nommé, hostConfig) sont
        fusionnés après validation.
      </p>

      <BlocIdentiteEtCommandeCreationConteneurLab etat={etat} majEtat={majEtat} />
      <BlocOptionsMoteurDockerCreationConteneurLab etat={etat} majEtat={majEtat} />
      <BlocReseauEtEnvironnementCreationConteneurLab etat={etat} majEtat={majEtat} />
      <BlocHoteRuntimeEtMemoireCreationConteneurLab etat={etat} majEtat={majEtat} />
      <BlocSecuriteRessourcesEtJsonCreationConteneurLab etat={etat} majEtat={majEtat} />

      <button type="button" onClick={() => void surCreer()}>
        Créer le conteneur
      </button>
    </section>
  );
}
