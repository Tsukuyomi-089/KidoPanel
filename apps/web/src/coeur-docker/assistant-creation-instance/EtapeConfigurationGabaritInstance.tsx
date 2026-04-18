import type { InstanceTemplate } from "@kidopanel/container-catalog";

type Props = {
  gabarit: InstanceTemplate;
  texteConfigurationJson: string;
  surTexteConfigurationJson: (texte: string) => void;
  surRetourListe: () => void;
  surModeAvance: () => void;
  surCreer: () => void;
  creationEnCours: boolean;
  messageErreur: string | null;
};

/**
 * Deuxième étape : préconfiguration JSON fusionnable avec le gabarit avant envoi à la passerelle.
 */
export function EtapeConfigurationGabaritInstance({
  gabarit,
  texteConfigurationJson,
  surTexteConfigurationJson,
  surRetourListe,
  surModeAvance,
  surCreer,
  creationEnCours,
  messageErreur,
}: Props) {
  return (
    <section className="kp-assistant-instance__etape" aria-labelledby="kp-titre-etape-config">
      <h2 id="kp-titre-etape-config" className="kp-assistant-instance__titre-etape">
        Personnaliser la configuration
      </h2>
      <p className="kp-assistant-instance__intro">
        Gabarit sélectionné : <strong>{gabarit.name}</strong>. Le JSON ci-dessous est fusionné en profondeur avec
        la configuration par défaut du gabarit puis transmis avec son identifiant (`templateId`).
      </p>
      {messageErreur !== null ? (
        <p className="kp-assistant-instance__erreur" role="alert">
          {messageErreur}
        </p>
      ) : null}
      <div className="kp-assistant-instance__actions-haut">
        <button type="button" className="bouton-secondaire-kido" onClick={surRetourListe}>
          Retour au choix des gabarits
        </button>
        <button type="button" className="bouton-secondaire-kido" onClick={surModeAvance}>
          Mode avancé (formulaire complet)
        </button>
      </div>
      <label className="kp-assistant-instance__label-json" htmlFor="kp-json-configuration-template">
        Surcouche JSON (`configuration`)
      </label>
      <textarea
        id="kp-json-configuration-template"
        className="kp-assistant-instance__textarea-json"
        rows={14}
        value={texteConfigurationJson}
        onChange={(e) => surTexteConfigurationJson(e.target.value)}
        spellCheck={false}
      />
      <div className="kp-assistant-instance__actions-bas">
        <button
          type="button"
          className="bouton-principal-kido"
          onClick={surCreer}
          disabled={creationEnCours}
        >
          {creationEnCours ? "Création en cours…" : "Créer l’instance"}
        </button>
      </div>
    </section>
  );
}
