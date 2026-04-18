/**
 * Liste paginée des comptes : squelette UI en attendant les routes passerelle `/admin/users` décrites dans la feuille de route PaaS.
 */
export function PageListeUtilisateurs() {
  return (
    <div className="kidopanel-page-centree">
      <h1 className="kidopanel-titre-page">Utilisateurs</h1>
      <p className="kidopanel-sous-titre-page">
        Tableau des comptes, filtres et pagination seront alimentés par les routes d’administration backend (aucun appel Prisma depuis la passerelle publique).
      </p>
      <section className="kidopanel-carte-principale kidopanel-carte-muted">
        <p className="kidopanel-texte-muted">
          Étape suivante : exposer une API interne protégée réservée aux jetons avec rôle ADMIN, puis brancher TanStack Query sur cette page.
        </p>
      </section>
    </div>
  );
}
