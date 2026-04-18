import { useParams } from "react-router-dom";

/**
 * Détail d’un compte : quotas et instances associées ; données à charger depuis le futur module auth-service ou passerelle admin.
 */
export function PageDetailUtilisateur() {
  const { idUtilisateur } = useParams<{ idUtilisateur: string }>();

  return (
    <div className="kidopanel-page-centree">
      <h1 className="kidopanel-titre-page">Compte utilisateur</h1>
      <p className="kidopanel-sous-titre-page">
        Identifiant demandé : <span className="kidopanel-cellule-mono">{idUtilisateur ?? "—"}</span>
      </p>
      <section className="kidopanel-carte-principale kidopanel-carte-muted">
        <p className="kidopanel-texte-muted">
          Les relations Prisma User, UserQuota, GameServerInstance et WebInstance seront exposées via une API dédiée ; cette page affichera alors les métriques consolidées.
        </p>
      </section>
    </div>
  );
}
