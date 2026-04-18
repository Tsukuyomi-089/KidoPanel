import { LISTE_GABARITS_JEU_INSTANCE } from "@kidopanel/container-catalog";
import type { GabaritJeuCatalogueInstance } from "@kidopanel/container-catalog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { creerInstanceServeurJeuxPasserelle } from "../passerelle/serviceServeursJeuxPasserelle.js";
import { EtapeConfigurationCreationServeur, construireValeursInitialesDepuisChamps } from "./EtapeConfigurationCreationServeur.js";
import { EtapeConfirmationCreationServeur } from "./EtapeConfirmationCreationServeur.js";
import { EtapeListeJeuxCreationServeur } from "./EtapeListeJeuxCreationServeur.js";
import {
  traduireServeurPersonnaliseVersCorpsApi,
  traduireValeursFormulaireVersCorpsApi,
} from "./traducteur-formulaire-vers-api.js";

/**
 * Assistant en trois étapes : choix du jeu, paramètres métiers et confirmation sans JSON ni variables Docker brutes.
 */
export function PageCreationServeur() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [modePersonnalise, setModePersonnalise] = useState(false);
  const [gabaritChoisi, setGabaritChoisi] = useState<GabaritJeuCatalogueInstance | null>(
    null,
  );

  const [nomAffiche, setNomAffiche] = useState("");
  const [memoireMb, setMemoireMb] = useState(3072);
  const [cpuCores, setCpuCores] = useState(2);
  const [diskGb, setDiskGb] = useState(20);
  const [valeursFormulaireMétier, setValeursFormulaireMétier] = useState<
    Record<string, string>
  >({});

  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [secondesInstallationAffichees, setSecondesInstallationAffichees] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (secondesInstallationAffichees === null || secondesInstallationAffichees <= 0) {
      return;
    }
    const id = window.setInterval(() => {
      setSecondesInstallationAffichees((s) =>
        s !== null && s > 0 ? s - 1 : 0,
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondesInstallationAffichees]);

  const gabarits = useMemo(
    () =>
      LISTE_GABARITS_JEU_INSTANCE.filter((g) => g.id !== "tmpl-jeu-personnalise"),
    [],
  );

  const valeursInitialesFormulaire = useMemo(() => {
    if (gabaritChoisi === null || modePersonnalise) {
      return {};
    }
    return construireValeursInitialesDepuisChamps(gabaritChoisi.champsFormulaire);
  }, [gabaritChoisi, modePersonnalise]);

  const choisirJeu = useCallback((g: GabaritJeuCatalogueInstance) => {
    setModePersonnalise(false);
    setGabaritChoisi(g);
    setNomAffiche(`Serveur ${g.name}`);
    setMemoireMb(g.defaultMemoryMb);
    setCpuCores(g.defaultCpuCores);
    setDiskGb(g.disqueParDefautGb);
    setEtape(2);
    setErreur(null);
  }, []);

  const choisirPersonnalise = useCallback(() => {
    setModePersonnalise(true);
    setGabaritChoisi(null);
    setNomAffiche("Mon serveur");
    setMemoireMb(2048);
    setCpuCores(1);
    setDiskGb(10);
    setEtape(2);
    setErreur(null);
  }, []);

  const retourEtape1 = useCallback(() => {
    setEtape(1);
    setErreur(null);
  }, []);

  const retourEtapeConfiguration = useCallback(() => {
    setEtape(2);
    setErreur(null);
  }, []);

  const allerConfirmation = useCallback(() => {
    setErreur(null);
    if (nomAffiche.trim().length === 0) {
      setErreur("Indiquez un nom de serveur.");
      return;
    }
    setEtape(3);
  }, [nomAffiche]);

  const allerConfirmationDepuisFormulaire = useCallback(
    (vals: Record<string, string>) => {
      setValeursFormulaireMétier(vals);
      allerConfirmation();
    },
    [allerConfirmation],
  );

  const lancerInstallation = useCallback(() => {
    if (modePersonnalise) {
      void (async () => {
        const estime = 120;
        setSecondesInstallationAffichees(estime);
        setEnCours(true);
        setErreur(null);
        try {
          const corps = traduireServeurPersonnaliseVersCorpsApi({
            nomServeur: nomAffiche,
            memoryMb: memoireMb,
            cpuCores,
            diskGb,
          });
          const cree = await creerInstanceServeurJeuxPasserelle(corps);
          void navigate(`/serveurs/${encodeURIComponent(cree.id)}`, { replace: true });
        } catch (e) {
          setErreur(e instanceof Error ? e.message : "Création refusée.");
        } finally {
          setEnCours(false);
          setSecondesInstallationAffichees(null);
        }
      })();
      return;
    }
    if (gabaritChoisi === null) {
      return;
    }
    void (async () => {
      const estime = gabaritChoisi.installTimeEstimateSeconds;
      setSecondesInstallationAffichees(estime);
      setEnCours(true);
      setErreur(null);
      try {
        const corps = traduireValeursFormulaireVersCorpsApi({
          gabarit: gabaritChoisi,
          nomServeur: nomAffiche,
          memoryMb: memoireMb,
          cpuCores,
          diskGb,
          valeursChamps: valeursFormulaireMétier,
        });
        const cree = await creerInstanceServeurJeuxPasserelle(corps);
        void navigate(`/serveurs/${encodeURIComponent(cree.id)}`, { replace: true });
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Création refusée.");
      } finally {
        setEnCours(false);
        setSecondesInstallationAffichees(null);
      }
    })();
  }, [
    cpuCores,
    diskGb,
    gabaritChoisi,
    memoireMb,
    modePersonnalise,
    navigate,
    nomAffiche,
    valeursFormulaireMétier,
  ]);

  return (
    <div className="kidopanel-page-centree">
      <p className="kidopanel-texte-muted">
        <Link to="/serveurs" className="kidopanel-lien-bouton-secondaire">
          Retour à la liste
        </Link>
      </p>

      {etape === 1 ? (
        <EtapeListeJeuxCreationServeur
          gabarits={gabarits}
          surChoisirJeu={choisirJeu}
          surChoisirPersonnalise={choisirPersonnalise}
        />
      ) : null}

      {etape === 2 ? (
        <>
          <button type="button" className="bouton-secondaire-kido" onClick={retourEtape1}>
            Retour au choix du jeu
          </button>
          <EtapeConfigurationCreationServeur
            messageErreur={erreur}
            modePersonnalise={modePersonnalise}
            gabaritChoisi={gabaritChoisi}
            nomAffiche={nomAffiche}
            surNomAffiche={setNomAffiche}
            memoireMb={memoireMb}
            surMemoireMb={setMemoireMb}
            cpuCores={cpuCores}
            surCpuCores={setCpuCores}
            diskGb={diskGb}
            surDiskGb={setDiskGb}
            valeursInitialesFormulaire={valeursInitialesFormulaire}
            surContinuerAvecFormulaire={allerConfirmationDepuisFormulaire}
            surContinuerPersonnalise={allerConfirmation}
          />
        </>
      ) : null}

      {etape === 3 ? (
        <>
          <button type="button" className="bouton-secondaire-kido" onClick={retourEtapeConfiguration}>
            Modifier la configuration
          </button>
          <EtapeConfirmationCreationServeur
            modePersonnalise={modePersonnalise}
            gabaritChoisi={gabaritChoisi}
            nomAffiche={nomAffiche}
            memoireMb={memoireMb}
            cpuCores={cpuCores}
            diskGb={diskGb}
            erreur={erreur}
            enCours={enCours}
            secondesInstallationAffichees={secondesInstallationAffichees}
            surLancer={lancerInstallation}
          />
        </>
      ) : null}
    </div>
  );
}
