import { useCallback, useEffect, useState } from "react";
import { InterfaceTestPasserelle } from "./lab/InterfaceTestPasserelle.js";
import {
  enregistrerJetonApresAuthentificationPanel,
  lireJetonStockage,
} from "./lab/passerelleClient.js";
import { BarreApplicationKidoPanel } from "./interface/BarreApplicationKidoPanel.js";
import { PageAuthentificationKidoPanel } from "./interface/PageAuthentificationKidoPanel.js";
import { VueAccueilKidoPanel } from "./interface/VueAccueilKidoPanel.js";
import { effacerToutJetonPasserelle } from "./passerelle/jetonPasserelleStockage.js";
import { extraireEmailDepuisJetonClient } from "./passerelle/lectureEmailJetonClient.js";
import "./App.css";
import "./interface/interface-kido-panel.css";

type VueApplication = "authentification" | "accueil" | "laboratoire";

function emailAffichageDepuisStockage(): string {
  const jeton = lireJetonStockage();
  if (jeton.trim() === "") {
    return "";
  }
  return extraireEmailDepuisJetonClient(jeton) ?? "Compte authentifié";
}

/**
 * Application web : authentification française, tableau de bord minimal, accès au laboratoire technique.
 */
function App() {
  const [vue, setVue] = useState<VueApplication>(() =>
    lireJetonStockage().trim() !== "" ? "accueil" : "authentification",
  );
  const [emailAffiche, setEmailAffiche] = useState<string>(emailAffichageDepuisStockage);

  useEffect(() => {
    const racine = document.getElementById("root");
    racine?.classList.add("racine-kidopanel");
    return () => {
      racine?.classList.remove("racine-kidopanel");
    };
  }, []);

  const surSessionEtablie = useCallback(
    (parametres: { jeton: string; email: string; seSouvenir: boolean }) => {
      enregistrerJetonApresAuthentificationPanel(parametres.jeton, parametres.seSouvenir);
      setEmailAffiche(parametres.email);
      setVue("accueil");
    },
    [],
  );

  const surDeconnexion = useCallback(() => {
    effacerToutJetonPasserelle();
    setEmailAffiche("");
    setVue("authentification");
  }, []);

  if (vue === "authentification") {
    return <PageAuthentificationKidoPanel surSessionEtablie={surSessionEtablie} />;
  }

  return (
    <div className="fond-app-kido">
      <BarreApplicationKidoPanel
        emailUtilisateur={emailAffiche}
        surAccueil={() => setVue("accueil")}
        surLaboratoire={() => setVue("laboratoire")}
        surDeconnexion={surDeconnexion}
        vueCourante={vue === "laboratoire" ? "laboratoire" : "accueil"}
      />
      <div className="zone-principale-app">
        {vue === "accueil" ? (
          <VueAccueilKidoPanel emailUtilisateur={emailAffiche} />
        ) : (
          <InterfaceTestPasserelle />
        )}
      </div>
    </div>
  );
}

export default App;
