import { useParams } from "react-router-dom";

/**
 * Formulaire d’édition des quotas par utilisateur ; validation Zod côté client une fois les points de terminaison disponibles.
 */
export function PageGestionQuotas() {
  const { idUtilisateur } = useParams<{ idUtilisateur: string }>();

  return (
    <div className="kidopanel-page-centree">
      <h1 className="kidopanel-titre-page">Quotas du compte</h1>
      <p className="kidopanel-sous-titre-page">
        Utilisateur : <span className="kidopanel-cellule-mono">{idUtilisateur ?? "—"}</span>
      </p>
      <section className="kidopanel-carte-principale kidopanel-carte-muted">
        <p className="kidopanel-texte-muted">
          Les champs maxInstances, maxMemoryMb, maxCpuCores et maxDiskGb seront synchronisés avec le modèle UserQuota après mise en place du service billing ou d’un contrôleur admin sécurisé.
        </p>
      </section>
    </div>
  );
}
