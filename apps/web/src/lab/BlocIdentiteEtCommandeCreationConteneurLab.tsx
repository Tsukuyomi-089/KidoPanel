import { useEffect, useState } from "react";
import type { ImageCatalogueApi } from "@kidopanel/container-catalog";
import { SegmentRepliableCreationKidoPanel } from "../interface/SegmentRepliableCreationKidoPanel.js";
import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import {
  GrilleCatalogueImagesCreationConteneurLab,
  libelleCategorieImageCatalogueLab,
} from "./GrilleCatalogueImagesCreationConteneurLab.js";
import {
  AIDE_ADRESSE_MAC,
  AIDE_CMD,
  AIDE_DOMAINNAME,
  AIDE_ENTRYPOINT,
  AIDE_HOSTNAME_CONTENEUR,
  AIDE_IMAGE_REFERENCE,
  AIDE_NOM_CONTENEUR,
  AIDE_REPERTOIRE_TRAVAIL,
  AIDE_SIGNAL_ARRET,
  AIDE_UTILISATEUR_PROCESSUS,
} from "./definitionsAidesCreationConteneurLab.js";
import { appelerPasserelle } from "./passerelleClient.js";
import {
  styleChampTexteCreation,
  styleLabelChampCreation,
  styleTitreChampCreation,
} from "./stylesFormulaireCreationConteneurLab.js";
import { TexteAideChampCreationConteneurLab } from "./TexteAideChampCreationConteneurLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
  /** Jeton JWT courant : sans jeton, le catalogue `GET /images` n’est pas chargé. */
  jetonSession: string;
};

/** Identité catalogue, nom du conteneur, commande, entrypoint et identité processus. */
export function BlocIdentiteEtCommandeCreationConteneurLab({
  etat,
  majEtat,
  jetonSession,
}: Props) {
  const [imagesCatalogue, setImagesCatalogue] = useState<ImageCatalogueApi[]>(
    [],
  );
  const [chargementCatalogue, setChargementCatalogue] = useState(false);
  const [erreurCatalogue, setErreurCatalogue] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    if (jetonSession.trim() === "") {
      setImagesCatalogue([]);
      setErreurCatalogue(null);
      setChargementCatalogue(false);
      return () => {
        annule = true;
      };
    }
    setChargementCatalogue(true);
    setErreurCatalogue(null);
    void (async () => {
      const reponse = await appelerPasserelle("/images", {
        method: "GET",
        jetonBearer: jetonSession,
      });
      if (annule) {
        return;
      }
      if (!reponse.ok) {
        setImagesCatalogue([]);
        setErreurCatalogue(
          `Impossible de charger le catalogue d’images (HTTP ${reponse.status}).`,
        );
        setChargementCatalogue(false);
        return;
      }
      try {
        const donnees = (await reponse.json()) as { images?: ImageCatalogueApi[] };
        const liste = Array.isArray(donnees.images) ? donnees.images : [];
        setImagesCatalogue(liste);
        setErreurCatalogue(null);
      } catch {
        setImagesCatalogue([]);
        setErreurCatalogue("Réponse catalogue d’images invalide (JSON).");
      } finally {
        if (!annule) {
          setChargementCatalogue(false);
        }
      }
    })();
    return () => {
      annule = true;
    };
  }, [jetonSession]);

  const selection = imagesCatalogue.find((x) => x.id === etat.imageCatalogId);

  return (
    <>
      <div className="kp-creation-sous-carte">
        <h2>Image officielle et nom Docker</h2>
        <div style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation} id="kp-catalogue-image-titre">
            Catalogue contrôlé (imageCatalogId)
          </span>
          <TexteAideChampCreationConteneurLab texte={AIDE_IMAGE_REFERENCE} />
          <GrilleCatalogueImagesCreationConteneurLab
            images={imagesCatalogue}
            identifiantSelectionne={etat.imageCatalogId}
            interactionDesactivee={
              chargementCatalogue ||
              jetonSession.trim() === "" ||
              imagesCatalogue.length === 0
            }
            surSelection={(id) => {
              majEtat({ imageCatalogId: id });
            }}
          />
          <p className="kp-creation-catalogue-select-hint">
            Liste compacte : identifiant unique du corps JSON vers la passerelle (ex. nginx, postgres).
          </p>
          <select
          aria-labelledby="kp-catalogue-image-titre"
          value={
            imagesCatalogue.some((x) => x.id === etat.imageCatalogId)
              ? etat.imageCatalogId
              : ""
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v !== "") {
              majEtat({ imageCatalogId: v });
            }
          }}
          disabled={
            chargementCatalogue ||
            jetonSession.trim() === "" ||
            imagesCatalogue.length === 0
          }
          style={styleChampTexteCreation}
        >
          {jetonSession.trim() === "" ? (
            <option value="">Connexion requise pour lister les images</option>
          ) : chargementCatalogue ? (
            <option value="">Chargement du catalogue…</option>
          ) : imagesCatalogue.length === 0 ? (
            <option value="">Aucune image catalogue (vérifiez la connexion)</option>
          ) : (
            imagesCatalogue.map((img) => (
              <option key={img.id} value={img.id}>
                {img.id} — {img.referenceDocker}
              </option>
            ))
          )}
        </select>
        {erreurCatalogue !== null ? (
          <p style={{ fontSize: "0.85rem", color: "#b00020", marginTop: 6 }}>
            {erreurCatalogue}
          </p>
        ) : null}
        {selection !== undefined ? (
          <div
            style={{
              marginTop: 8,
              fontSize: "0.88rem",
              opacity: 0.92,
              lineHeight: 1.45,
            }}
          >
            <div>
              <strong>Catégorie :</strong>{" "}
              {libelleCategorieImageCatalogueLab(selection.categorie)}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Description :</strong> {selection.description}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Référence Docker résolue :</strong>{" "}
              <code>{selection.referenceDocker}</code>
            </div>
          </div>
        ) : null}
        </div>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Nom du conteneur sur l’hôte</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_NOM_CONTENEUR} />
          <input
            value={etat.nom}
            onChange={(e) => majEtat({ nom: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
      </div>

      <SegmentRepliableCreationKidoPanel
        titre="Commande, point d’entrée et identité du processus"
        sousTitre="Cmd, Entrypoint, WorkingDir, User, Hostname, Domainname, MAC, StopSignal"
        variante="accent"
      >
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Arguments de commande (Cmd)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_CMD} />
          <textarea
            value={etat.cmdLignes}
            onChange={(e) => majEtat({ cmdLignes: e.target.value })}
            rows={4}
            style={{ ...styleChampTexteCreation, minHeight: "4.5rem" }}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Point d’entrée (Entrypoint)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_ENTRYPOINT} />
          <textarea
            value={etat.entrypointLignes}
            onChange={(e) => majEtat({ entrypointLignes: e.target.value })}
            rows={3}
            style={{ ...styleChampTexteCreation, minHeight: "3.2rem" }}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Répertoire de travail (WorkingDir)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_REPERTOIRE_TRAVAIL} />
          <input
            value={etat.repertoireTravail}
            onChange={(e) => majEtat({ repertoireTravail: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Utilisateur du processus principal (User)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_UTILISATEUR_PROCESSUS} />
          <input
            value={etat.utilisateur}
            onChange={(e) => majEtat({ utilisateur: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Nom d’hôte interne au conteneur (Hostname)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_HOSTNAME_CONTENEUR} />
          <input
            value={etat.nomHote}
            onChange={(e) => majEtat({ nomHote: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Domaine DNS du conteneur (Domainname)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_DOMAINNAME} />
          <input
            value={etat.domaineConteneur}
            onChange={(e) => majEtat({ domaineConteneur: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Adresse MAC de l’interface réseau (MacAddress)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_ADRESSE_MAC} />
          <input
            value={etat.adresseMac}
            onChange={(e) => majEtat({ adresseMac: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation}>Signal d’arrêt propre (StopSignal)</span>
          <TexteAideChampCreationConteneurLab texte={AIDE_SIGNAL_ARRET} />
          <input
            value={etat.signalArret}
            onChange={(e) => majEtat({ signalArret: e.target.value })}
            style={styleChampTexteCreation}
          />
        </label>
      </SegmentRepliableCreationKidoPanel>
    </>
  );
}
