import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listerDomainesProxyPasserelle,
  supprimerDomaineProxyPasserelle,
  type DomaineProxyPasserelle,
} from "../passerelle/serviceProxyManagerPasserelle.js";
import { listerWebInstancesPasserelle } from "../passerelle/serviceWebInstancesPasserelle.js";
import { useToastKidoPanel } from "../interface/useToastKidoPanel.js";

/** Liste des domaines utilisateur et lien vers création ou détail container. */
export function PageProxyManager() {
  const [domaines, setDomaines] = useState<DomaineProxyPasserelle[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomsInstances, setNomsInstances] = useState<Record<string, string>>({});
  const { pousserToast } = useToastKidoPanel();

  useEffect(() => {
    let vivant = true;
    void (async () => {
      try {
        const [d, inst] = await Promise.all([
          listerDomainesProxyPasserelle(),
          listerWebInstancesPasserelle(),
        ]);
        const mapNoms: Record<string, string> = {};
        for (const i of inst) {
          mapNoms[i.id] = i.name;
        }
        if (vivant) {
          setDomaines(d);
          setNomsInstances(mapNoms);
          setErreur(null);
        }
      } catch (e) {
        if (vivant) {
          setErreur(e instanceof Error ? e.message : "Erreur.");
          setDomaines([]);
        }
      }
    })();
    return () => {
      vivant = false;
    };
  }, []);

  const retirer = async (id: string) => {
    try {
      await supprimerDomaineProxyPasserelle(id);
      setDomaines((prev) => (prev === null ? prev : prev.filter((x) => x.id !== id)));
      pousserToast("Domaine supprimé.", "succes");
    } catch (e) {
      pousserToast(e instanceof Error ? e.message : "Suppression impossible.", "erreur");
    }
  };

  return (
    <>
      <p className="kp-texte-muted">
        <Link to="/hebergement" className="kp-lien-inline">
          Hébergement web
        </Link>
      </p>
      <div className="kp-page-entete">
        <div>
          <h1 className="kp-page-titre">Proxy Manager</h1>
          <p className="kp-page-sous-titre">Domaines HTTP(S) relayés vers vos containers internes.</p>
        </div>
        <Link to="/hebergement/proxy/nouveau" className="kp-btn kp-btn--primaire">
          Ajouter un domaine
        </Link>
      </div>
      {erreur !== null ? (
        <pre className="kp-cellule-mono" role="alert">
          {erreur}
        </pre>
      ) : null}
      {domaines === null ? (
        <p className="kp-texte-muted">Chargement…</p>
      ) : domaines.length === 0 ? (
        <p className="kp-texte-muted">Aucun domaine configuré.</p>
      ) : (
        <div style={{ overflowX: "auto" }} className="kp-marges-haut-sm">
          <table className="kidopanel-tableau">
            <thead>
              <tr>
                <th>Domaine</th>
                <th>Container</th>
                <th>Port</th>
                <th>SSL</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {domaines.map((d) => (
                <tr key={d.id}>
                  <td>
                    <a href={`https://${d.domaine}`} target="_blank" rel="noreferrer">
                      {d.domaine}
                    </a>
                  </td>
                  <td>
                    {d.webInstanceId !== null ? (
                      <Link
                        to={`/hebergement/containers/${encodeURIComponent(d.webInstanceId)}`}
                        className="kp-lien-inline"
                      >
                        {nomsInstances[d.webInstanceId] ?? d.webInstanceId.slice(0, 8)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{String(d.portCible)}</td>
                  <td>{d.sslActif ? "Actif" : "Non configuré"}</td>
                  <td>
                    <button type="button" className="kp-btn kp-btn--ghost kp-btn--sm" onClick={() => void retirer(d.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
