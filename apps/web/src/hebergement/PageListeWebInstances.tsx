import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listerWebInstancesPasserelle,
  type WebInstancePasserelle,
} from "../passerelle/serviceWebInstancesPasserelle.js";
import { CarteWebInstance } from "./composants/CarteWebInstance.js";

/** Liste des instances web du compte. */
export function PageListeWebInstances() {
  const [instances, setInstances] = useState<WebInstancePasserelle[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const liste = await listerWebInstancesPasserelle();
      setInstances(liste);
      setErreur(null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible.");
      setInstances([]);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const remplacerInstance = useCallback((maj: WebInstancePasserelle) => {
    setInstances((prev) => {
      if (prev === null) return prev;
      return prev.map((x) => (x.id === maj.id ? maj : x));
    });
  }, []);

  return (
    <>
      <p className="kp-texte-muted">
        <Link to="/hebergement" className="kp-lien-inline">
          Hébergement web
        </Link>
      </p>
      <div className="kp-page-entete">
        <div>
          <h1 className="kp-page-titre">Mes containers</h1>
          <p className="kp-page-sous-titre">
            Stacks applicatives pilotées via le service web et le moteur Docker (passerelle uniquement).
          </p>
        </div>
        <Link to="/hebergement/containers/nouveau" className="kp-btn kp-btn--primaire">
          Nouveau container
        </Link>
      </div>
      {erreur !== null ? (
        <pre className="kp-cellule-mono" role="alert">
          {erreur}
        </pre>
      ) : null}
      {instances === null ? (
        <p className="kp-texte-muted">Chargement…</p>
      ) : instances.length === 0 ? (
        <p className="kp-texte-muted">Aucune instance pour l’instant.</p>
      ) : (
        <div className="kp-grille-cartes-serveurs kp-marges-haut-sm">
          {instances.map((inst) => (
            <CarteWebInstance
              key={inst.id}
              instance={inst}
              surMiseAJourListe={charger}
              surMiseAJourPartielle={remplacerInstance}
            />
          ))}
        </div>
      )}
    </>
  );
}
