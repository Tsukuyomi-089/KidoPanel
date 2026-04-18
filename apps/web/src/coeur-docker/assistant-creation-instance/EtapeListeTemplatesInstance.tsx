import type { InstanceTemplate } from "@kidopanel/container-catalog";

type Props = {
  gabarits: InstanceTemplate[];
  chargement: boolean;
  erreur: string | null;
  surChoisir: (gabarit: InstanceTemplate) => void;
};

/**
 * Première étape : grille des gabarits métier retournés par la passerelle.
 */
export function EtapeListeTemplatesInstance({
  gabarits,
  chargement,
  erreur,
  surChoisir,
}: Props) {
  return (
    <section className="kp-assistant-instance__etape" aria-labelledby="kp-titre-etape-templates">
      <h2 id="kp-titre-etape-templates" className="kp-assistant-instance__titre-etape">
        Choisir un gabarit
      </h2>
      <p className="kp-assistant-instance__intro">
        Chaque gabarit associe une image du catalogue officiel à une configuration de départ ; vous pourrez la
        personnaliser à l’étape suivante ou passer en mode avancé.
      </p>
      {erreur !== null ? (
        <p className="kp-assistant-instance__erreur" role="alert">
          {erreur}
        </p>
      ) : null}
      {chargement ? (
        <p className="kp-assistant-instance__chargement">Chargement des gabarits…</p>
      ) : gabarits.length === 0 ? (
        <p>Aucun gabarit disponible.</p>
      ) : (
        <ul className="kp-assistant-instance__liste-cartes">
          {gabarits.map((g) => (
            <li key={g.id}>
              <article className="kp-assistant-instance__carte">
                <h3 className="kp-assistant-instance__carte-titre">{g.name}</h3>
                <p className="kp-assistant-instance__carte-desc">{g.description}</p>
                <p className="kp-assistant-instance__carte-meta">
                  <span className="kp-assistant-instance__badge">{g.category}</span>
                  <span className="kp-assistant-instance__carte-ref">
                    Catalogue : <code>{g.imageCatalogId}</code>
                  </span>
                </p>
                <button type="button" className="bouton-principal-kido" onClick={() => surChoisir(g)}>
                  Utiliser ce gabarit
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
