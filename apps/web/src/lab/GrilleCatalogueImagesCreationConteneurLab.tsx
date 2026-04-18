import type { ImageCatalogueApi } from "@kidopanel/container-catalog";

type Props = {
  images: ImageCatalogueApi[];
  identifiantSelectionne: string;
  surSelection: (id: string) => void;
  interactionDesactivee: boolean;
};

/** Libellé court pour l’affichage de la catégorie métier dans le lab. */
export function libelleCategorieImageCatalogueLab(
  categorie: ImageCatalogueApi["categorie"],
): string {
  switch (categorie) {
    case "web":
      return "Web";
    case "db":
      return "Base de données";
    case "runtime":
      return "Runtime";
    case "utilitaire":
      return "Utilitaire";
    default:
      return categorie;
  }
}

/**
 * Grille de cartes pour choisir une entrée du catalogue officiel ;
 * complète la liste déroulante sans la remplacer pour les usages compacts ou lecteurs d’écran.
 */
export function GrilleCatalogueImagesCreationConteneurLab({
  images,
  identifiantSelectionne,
  surSelection,
  interactionDesactivee,
}: Props) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className="kp-creation-catalogue-grille"
      role="list"
      aria-label="Catalogue d’images officielles"
    >
      {images.map((img) => {
        const actif = img.id === identifiantSelectionne;
        return (
          <button
            key={img.id}
            type="button"
            role="listitem"
            className={
              actif
                ? "kp-creation-catalogue-fiche kp-creation-catalogue-fiche--actif"
                : "kp-creation-catalogue-fiche"
            }
            disabled={interactionDesactivee}
            onClick={() => {
              surSelection(img.id);
            }}
          >
            <span className="kp-creation-catalogue-fiche__id">{img.id}</span>
            <span className="kp-creation-catalogue-fiche__cat">
              {libelleCategorieImageCatalogueLab(img.categorie)}
            </span>
            <code className="kp-creation-catalogue-fiche__ref">{img.referenceDocker}</code>
          </button>
        );
      })}
    </div>
  );
}
