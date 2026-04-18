import type { GabaritJeuCatalogueInstance } from "@kidopanel/container-catalog";

function memoireVersGo(mb: number): string {
  if (mb >= 1024) {
    const go = mb / 1024;
    const arrondi = Number.isInteger(go) ? String(go) : go.toFixed(1);
    return `${arrondi} Go`;
  }
  return `${String(mb)} Mo`;
}

function formaterDelaiInstallation(secondes: number): string {
  if (secondes < 60) {
    return `~${String(secondes)} s`;
  }
  return `~${String(Math.ceil(secondes / 60))} min`;
}

type PropsEtapeConfirmation = {
  modePersonnalise: boolean;
  gabaritChoisi: GabaritJeuCatalogueInstance | null;
  nomAffiche: string;
  memoireMb: number;
  cpuCores: number;
  diskGb: number;
  erreur: string | null;
  enCours: boolean;
  secondesInstallationAffichees: number | null;
  surLancer: () => void;
};

/**
 * Étape 3 : récapitulatif lisible et lancement de l'installation.
 */
export function EtapeConfirmationCreationServeur({
  modePersonnalise,
  gabaritChoisi,
  nomAffiche,
  memoireMb,
  cpuCores,
  diskGb,
  erreur,
  enCours,
  secondesInstallationAffichees,
  surLancer,
}: PropsEtapeConfirmation) {
  const portIndicatif =
    gabaritChoisi !== null && gabaritChoisi.defaultPorts.length > 0
      ? gabaritChoisi.defaultPorts[0]
      : null;

  return (
    <section className="kidopanel-carte-principale" style={{ marginTop: "1rem" }}>
      <h1 className="kidopanel-titre-page">Confirmation</h1>
      <ul className="kp-liste-recap-creation" style={{ lineHeight: 1.7 }}>
        <li>
          <strong>Jeu : </strong>
          {modePersonnalise
            ? "Personnalisé (CUSTOM)"
            : gabaritChoisi !== null
              ? gabaritChoisi.name
              : "—"}
        </li>
        <li>
          <strong>Nom du serveur : </strong>
          {nomAffiche.trim()}
        </li>
        <li>
          <strong>Ressources : </strong>
          {memoireVersGo(memoireMb)} RAM / {String(cpuCores)} cœur
          {cpuCores === 1 ? "" : "s"} / {String(diskGb)} Go disque
        </li>
        <li>
          <strong>Port de jeu : </strong>
          {portIndicatif !== null
            ? `${String(portIndicatif)} (publié automatiquement par le service)`
            : "attribué par le service"}
        </li>
        <li>
          <strong>Durée d'installation estimée : </strong>
          {modePersonnalise
            ? "~2 min"
            : gabaritChoisi !== null
              ? formaterDelaiInstallation(gabaritChoisi.installTimeEstimateSeconds)
              : "—"}
        </li>
      </ul>
      {erreur !== null ? (
        <div className="bandeau-erreur-auth" role="alert">
          {erreur}
        </div>
      ) : null}
      {enCours ? (
        <p className="kidopanel-texte-muted" role="status">
          Installation en cours…
          {secondesInstallationAffichees !== null && secondesInstallationAffichees > 0
            ? ` Temps restant indicatif : ${String(secondesInstallationAffichees)} s`
            : null}
        </p>
      ) : (
        <button type="button" className="bouton-principal-kido" onClick={surLancer}>
          Lancer l'installation
        </button>
      )}
    </section>
  );
}
