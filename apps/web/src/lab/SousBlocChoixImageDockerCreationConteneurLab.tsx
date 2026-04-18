import type { ImageCatalogueApi } from "@kidopanel/container-catalog";
import type { EtatCreationConteneurLab } from "./etatCreationConteneurLab.js";
import {
  GrilleCatalogueImagesCreationConteneurLab,
  libelleCategorieImageCatalogueLab,
} from "./GrilleCatalogueImagesCreationConteneurLab.js";
import {
  AIDE_IMAGE_REFERENCE,
  AIDE_REFERENCE_DOCKER_LIBRE,
} from "./definitionsAidesCreationConteneurLab.js";
import {
  styleChampTexteCreation,
  styleLabelChampCreation,
  styleTitreChampCreation,
} from "./stylesFormulaireCreationConteneurLab.js";
import { TexteAideChampCreationConteneurLab } from "./TexteAideChampCreationConteneurLab.js";

type Props = {
  etat: EtatCreationConteneurLab;
  majEtat: (partiel: Partial<EtatCreationConteneurLab>) => void;
  jetonSession: string;
  imagesCatalogue: ImageCatalogueApi[];
  chargementCatalogue: boolean;
  erreurCatalogue: string | null;
};

/**
 * Bascule catalogue officiel ou référence Docker libre, avec les contrôles associés.
 */
export function SousBlocChoixImageDockerCreationConteneurLab({
  etat,
  majEtat,
  jetonSession,
  imagesCatalogue,
  chargementCatalogue,
  erreurCatalogue,
}: Props) {
  const selection = imagesCatalogue.find((x) => x.id === etat.imageCatalogId);

  return (
    <>
      <div
        className="kp-creation-origine-image"
        role="radiogroup"
        aria-label="Origine de l’image Docker"
      >
        <label className="kp-creation-origine-image__option">
          <input
            type="radio"
            name="kidopanel-origine-image"
            checked={etat.origineImage === "catalogue"}
            onChange={() => {
              majEtat({ origineImage: "catalogue" });
            }}
          />
          <span>Catalogue KidoPanel</span>
        </label>
        <label className="kp-creation-origine-image__option">
          <input
            type="radio"
            name="kidopanel-origine-image"
            checked={etat.origineImage === "registre"}
            onChange={() => {
              majEtat({ origineImage: "registre" });
            }}
          />
          <span>Référence Docker (Docker Hub ou registre vu par le démon)</span>
        </label>
      </div>

      {etat.origineImage === "catalogue" ? (
        <div style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation} id="kp-catalogue-image-titre">
            Identifiant catalogue (`imageCatalogId`)
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
            Liste compacte : identifiant unique du corps JSON (ex. nginx, postgres).
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
      ) : (
        <label style={styleLabelChampCreation}>
          <span style={styleTitreChampCreation} id="kp-reference-docker-libre-titre">
            Référence Docker (`imageReference`)
          </span>
          <TexteAideChampCreationConteneurLab texte={AIDE_REFERENCE_DOCKER_LIBRE} />
          <input
            aria-labelledby="kp-reference-docker-libre-titre"
            value={etat.referenceDockerRegistre}
            onChange={(e) => majEtat({ referenceDockerRegistre: e.target.value })}
            placeholder="ex. traefik:v3.4, ghcr.io/org/image:tag"
            style={styleChampTexteCreation}
            autoComplete="off"
          />
        </label>
      )}
    </>
  );
}
