type PropsVueAccueilKidoPanel = {
  emailUtilisateur: string;
};

/**
 * Tableau de bord minimal après authentification : point d’entrée avant les écrans métier détaillés.
 */
export function VueAccueilKidoPanel({ emailUtilisateur }: PropsVueAccueilKidoPanel) {
  return (
    <section className="carte-tableau-bord">
      <h2>Bienvenue</h2>
      <p style={{ marginTop: 0, color: "var(--text)", lineHeight: 1.5 }}>
        Vous êtes connecté en tant que <strong>{emailUtilisateur}</strong>. Les actions sur les conteneurs
        passent par la passerelle avec votre jeton : chaque ressource reste isolée par compte.
      </p>
      <p style={{ color: "var(--text)", lineHeight: 1.5 }}>
        Utilisez l’entrée « Laboratoire passerelle » pour les essais techniques détaillés (création avancée,
        flux de journaux, sonde réseau). Les prochains écrans métier viendront remplacer progressivement ce
        socle.
      </p>
    </section>
  );
}
