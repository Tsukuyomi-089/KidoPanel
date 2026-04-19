import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listerReseauxInternesPasserelle,
  supprimerReseauInternePasserelle,
  type EnregistrementReseauInternePasserelle,
} from "../passerelle/serviceReseauxInternesPasserelle.js";
import { listerInstancesServeursJeuxPasserelle } from "../passerelle/serviceServeursJeuxPasserelle.js";
import { listerWebInstancesPasserelle } from "../passerelle/serviceWebInstancesPasserelle.js";
import { CarteReseau } from "./composants/CarteReseau.js";
import { useToastKidoPanel } from "../interface/useToastKidoPanel.js";
import { BandeauDiagnosticPareFeuHote } from "../interface/BandeauDiagnosticPareFeuHote.js";

function compterParReseau(
  idReseau: string,
  instancesJeu: Array<{ reseauInterneUtilisateurId?: string | null }>,
  instancesWeb: Array<{ reseauInterneUtilisateurId?: string | null }>,
): number {
  let n = 0;
  for (const j of instancesJeu) {
    if (j.reseauInterneUtilisateurId === idReseau) {
      n += 1;
    }
  }
  for (const w of instancesWeb) {
    if (w.reseauInterneUtilisateurId === idReseau) {
      n += 1;
    }
  }
  return n;
}

/** Liste des ponts réseau bridge privés du compte. */
export function PageListeReseaux() {
  const [reseaux, setReseaux] = useState<EnregistrementReseauInternePasserelle[] | null>(null);
  const [jeu, setJeu] = useState<Awaited<ReturnType<typeof listerInstancesServeursJeuxPasserelle>>>(
    [],
  );
  const [web, setWeb] = useState<Awaited<ReturnType<typeof listerWebInstancesPasserelle>>>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [avertissementComptage, setAvertissementComptage] = useState<string | null>(null);
  const { pousserToast } = useToastKidoPanel();

  const charger = useCallback(async () => {
    const resultats = await Promise.allSettled([
      listerReseauxInternesPasserelle(),
      listerInstancesServeursJeuxPasserelle(),
      listerWebInstancesPasserelle(),
    ]);
    const [resReseaux, resJeu, resWeb] = resultats;
    if (resReseaux.status === "rejected") {
      setErreur(
        resReseaux.reason instanceof Error
          ? resReseaux.reason.message
          : "Chargement des réseaux impossible.",
      );
      setReseaux([]);
      setJeu([]);
      setWeb([]);
      setAvertissementComptage(null);
      return;
    }
    setReseaux(resReseaux.value);
    setErreur(null);
    setJeu(resJeu.status === "fulfilled" ? resJeu.value : []);
    setWeb(resWeb.status === "fulfilled" ? resWeb.value : []);
    const echecJeu = resJeu.status === "rejected";
    const echecWeb = resWeb.status === "rejected";
    setAvertissementComptage(
      echecJeu && echecWeb
        ? "Comptage des instances par pont indisponible (services jeu et web injoignables). La liste des ponts ci-dessous reste correcte ; la création et la suppression de réseaux fonctionnent normalement."
        : echecWeb
          ? "Comptage « sites par pont » indisponible : service d’hébergement web (`web-service`, port 8791) non démarré. Sans hébergement web, ignorez cet avertissement — la liste des ponts et la création / suppression de réseaux fonctionnent normalement."
          : echecJeu
            ? "Comptage « serveurs jeu par pont » indisponible : service jeu (`server-service`, port 8790) non démarré. La liste des ponts ci-dessous reste correcte ; la création et la suppression de réseaux fonctionnent normalement."
            : null,
    );
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const supprimer = async (id: string) => {
    try {
      await supprimerReseauInternePasserelle(id);
      await charger();
      pousserToast("Réseau supprimé.", "succes");
    } catch (e) {
      pousserToast(e instanceof Error ? e.message : "Suppression refusée.", "erreur");
    }
  };

  const comptages = useMemo(() => {
    const m = new Map<string, number>();
    if (reseaux === null) {
      return m;
    }
    for (const x of reseaux) {
      m.set(x.id, compterParReseau(x.id, jeu, web));
    }
    return m;
  }, [jeu, reseaux, web]);

  return (
    <>
      <div className="kp-page-entete">
        <div>
          <h1 className="kp-page-titre">Réseaux privés</h1>
          <p className="kp-page-sous-titre">
            Ponts Docker isolés par compte (préfixes <span className="kp-cellule-mono">kidopanel-unet-…</span>).
          </p>
        </div>
        <Link to="/reseaux/nouveau" className="kp-btn kp-btn--primaire">
          Créer un réseau
        </Link>
      </div>
      {erreur !== null ? (
        <pre className="kp-cellule-mono" role="alert">
          {erreur}
        </pre>
      ) : null}
      <BandeauDiagnosticPareFeuHote lieuAffichage="Réseaux privés" />
      {avertissementComptage !== null ? (
        <div
          className="kp-bandeau-info kp-marges-haut-sm"
          role="status"
          style={{
            border: "1px solid var(--kp-couleur-bordure-douce, rgba(255,255,255,0.12))",
            borderRadius: "0.5rem",
            padding: "0.6rem 0.75rem",
            fontSize: "0.85rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
          }}
        >
          <span aria-hidden style={{ fontWeight: 600 }}>i</span>
          <span>
            <strong>Information (n’empêche pas la création)</strong> — {avertissementComptage}
          </span>
        </div>
      ) : null}
      {reseaux === null ? (
        <p className="kp-texte-muted kp-marges-haut-sm">Chargement…</p>
      ) : reseaux.length === 0 ? (
        <p className="kp-texte-muted kp-marges-haut-sm">
          Aucun réseau pour l’instant. Cliquez sur « Créer un réseau » ci-dessus pour ajouter votre premier pont privé.
        </p>
      ) : (
        <div className="kp-grille-cartes-serveurs kp-marges-haut-sm">
          {reseaux.map((r) => (
            <CarteReseau
              key={r.id}
              reseau={r}
              nombreInstancesLiees={comptages.get(r.id) ?? 0}
              peutSupprimer={(comptages.get(r.id) ?? 0) === 0}
              surSupprimer={(id) => void supprimer(id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
