import { Outlet, useNavigate } from "react-router-dom";
import { EnteteSessionKidoPanel } from "../interface/EnteteSessionKidoPanel.js";
import { RailNavigationKidoPanel } from "../interface/RailNavigationKidoPanel.js";
import { effacerToutJetonPasserelle } from "../passerelle/jetonPasserelleStockage.js";
import { extraireEmailDepuisJetonClient } from "../passerelle/lectureEmailJetonClient.js";
import { extraireRoleDepuisJetonClient } from "../passerelle/lectureRoleJetonClient.js";
import { lireJetonStockage } from "../lab/passerelleClient.js";

/**
 * Coque authentifiée : barre fixe et zone de contenu pour les routes protégées.
 */
export function ShellAuthentifieKidoPanel() {
  const navigate = useNavigate();
  const jeton = lireJetonStockage();
  const emailAffiche = extraireEmailDepuisJetonClient(jeton) ?? "Compte authentifié";
  const roleSession = extraireRoleDepuisJetonClient(jeton);

  return (
    <div className="fond-app-kido kidopanel-app-root">
      <RailNavigationKidoPanel
        roleSession={roleSession}
        surDeconnexion={() => {
          effacerToutJetonPasserelle();
          void navigate("/connexion", { replace: true });
        }}
      />
      <div className="kidopanel-colonne-principale">
        <EnteteSessionKidoPanel emailUtilisateur={emailAffiche} />
        <main className="kidopanel-corps-application">
          <div className="kidopanel-pave-contenu">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
