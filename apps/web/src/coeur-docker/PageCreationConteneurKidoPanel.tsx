import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { BandeauErreurPasserelleKidoPanel } from "../interface/BandeauErreurPasserelleKidoPanel.js";
import { etatDepuisCorpsCreationConteneurLab } from "../lab/etat-depuis-corps-creation-conteneur-lab.js";
import { SectionCreationConteneurAvanceLab } from "../lab/SectionCreationConteneurAvanceLab.js";
import { AssistantCreationInstanceKidoPanel } from "./assistant-creation-instance/AssistantCreationInstanceKidoPanel.js";
import { useGestionConteneursPasserelle } from "./GestionConteneursPasserelleProvider.js";

/**
 * Parcours guidé « créer une instance » puis formulaire expert existant après bascule explicite.
 */
export function PageCreationConteneurKidoPanel() {
  const g = useGestionConteneursPasserelle();
  const [formulaireExpertVisible, setFormulaireExpertVisible] = useState(false);

  const ouvrirFormulaireExpertDepuisCorps = useCallback(
    (corps: Record<string, unknown>) => {
      g.remplirFormulaireCreation(etatDepuisCorpsCreationConteneurLab(corps));
      setFormulaireExpertVisible(true);
    },
    [g],
  );

  return (
    <div className="kidopanel-page-centree kidopanel-page-creation kp-creation-page">
      <header className="kp-creation-page__hero">
        <nav className="kidopanel-fil-ariane kp-creation-page__fil" aria-label="Fil d’Ariane">
          <Link to="/coeur-docker">Cœur Docker</Link>
          <span aria-hidden="true"> / </span>
          <span>Créer une instance</span>
        </nav>
        <h1 className="kp-creation-page__titre">Créer une instance</h1>
        <p className="kp-creation-page__sous">
          Choisissez un gabarit métier puis affinez la configuration ; le mode expert reprend le formulaire complet
          historique lorsque vous en avez besoin.
        </p>
        <Link to="/coeur-docker" className="bouton-secondaire-kido kidopanel-lien-bouton-secondaire">
          Retour au cœur Docker
        </Link>
      </header>

      <BandeauErreurPasserelleKidoPanel
        messageErreur={g.messageErreur}
        refUrlContexteErreur={g.refUrlContexteErreur}
      />

      <div className="kidopanel-grille-creation">
        {!formulaireExpertVisible ? (
          <AssistantCreationInstanceKidoPanel
            jetonSession={g.jetonSession}
            surCreerDepuisTemplate={g.surCreerDepuisTemplate}
            surPasserModeAvanceAvecCorps={ouvrirFormulaireExpertDepuisCorps}
          />
        ) : (
          <div className="kp-creation-vue-expert">
            <button
              type="button"
              className="bouton-secondaire-kido"
              onClick={() => setFormulaireExpertVisible(false)}
            >
              Retour au parcours guidé par gabarits
            </button>
            <SectionCreationConteneurAvanceLab
              etat={g.etatCreation}
              majEtat={g.majEtatCreation}
              surCreer={() => void g.surCreer()}
              surRemplirFormulaire={g.remplirFormulaireCreation}
              surErreurConfiguration={(msg) => g.setMessageErreur(msg)}
              jetonSession={g.jetonSession}
              masquerParagrapheDocumentationApi
              terminologieInstance
            />
          </div>
        )}
      </div>
    </div>
  );
}
