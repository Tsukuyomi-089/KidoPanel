/**
 * Journal filtrable des actions : lecture du modèle AuditLog via API future ; aucune donnée sensible ne transitera sans filtrage serveur.
 */
export function PageJournalAudit() {
  return (
    <div className="kidopanel-page-centree">
      <h1 className="kidopanel-titre-page">Journal d’audit</h1>
      <p className="kidopanel-sous-titre-page">
        Historique des actions critiques (création, suppression, quotas, pilotage). Les filtres par action, ressource et plage horaire seront appliqués côté serveur.
      </p>
      <section className="kidopanel-carte-principale kidopanel-carte-muted">
        <p className="kidopanel-texte-muted">
          Le middleware d’audit passerelle et la persistance AuditLog permettront d’alimenter cette vue ; intégration prévue après stabilisation des routes métier.
        </p>
      </section>
    </div>
  );
}
