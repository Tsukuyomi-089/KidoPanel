type PropsBarreApplicationKidoPanel = {
  emailUtilisateur: string;
  surLaboratoire: () => void;
  surAccueil: () => void;
  surDeconnexion: () => void;
  vueCourante: "accueil" | "laboratoire";
};

/**
 * Barre supérieure fixe : navigation entre l’accueil et le laboratoire, déconnexion explicite.
 */
export function BarreApplicationKidoPanel({
  emailUtilisateur,
  surLaboratoire,
  surAccueil,
  surDeconnexion,
  vueCourante,
}: PropsBarreApplicationKidoPanel) {
  return (
    <header className="barre-app-kido">
      <div className="barre-app-kido__marque">KidoPanel</div>
      <div className="barre-app-kido__actions">
        <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>{emailUtilisateur}</span>
        <button
          type="button"
          className="bouton-secondaire-kido"
          aria-pressed={vueCourante === "accueil"}
          onClick={surAccueil}
        >
          Accueil
        </button>
        <button
          type="button"
          className="bouton-secondaire-kido"
          aria-pressed={vueCourante === "laboratoire"}
          onClick={surLaboratoire}
        >
          Laboratoire passerelle
        </button>
        <button type="button" className="bouton-secondaire-kido" onClick={surDeconnexion}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
