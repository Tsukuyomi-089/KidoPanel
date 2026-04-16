import type { Hono } from "hono";
import type { ContainerEngine } from "../../container-engine.js";
import { tryRespondWithEngineError } from "../respond-route-error.js";
import type { VariablesMoteurHttp } from "../variables-moteur-http.js";

/** Découpe une entrée `repo:tag` ou `repo@digest` renvoyée par Docker en nom et étiquette. */
function nomEtTagDepuisRepoTag(repoTag: string): { nom: string; tag: string } {
  const idxArobase = repoTag.lastIndexOf("@");
  const idxDeuxPoints = repoTag.lastIndexOf(":");
  if (idxArobase !== -1 && (idxDeuxPoints === -1 || idxArobase > idxDeuxPoints)) {
    return {
      nom: repoTag.slice(0, idxArobase),
      tag: repoTag.slice(idxArobase + 1),
    };
  }
  if (idxDeuxPoints === -1) {
    return { nom: repoTag, tag: "latest" };
  }
  return {
    nom: repoTag.slice(0, idxDeuxPoints),
    tag: repoTag.slice(idxDeuxPoints + 1),
  };
}

/** Réponse JSON pour une ligne d’image locale (champs demandés : nom, tag, taille). */
export interface ImageLocaleApi {
  nom: string;
  tag: string;
  taille: number;
}

/** Enregistre `GET /images` : inventaire des images présentes sur l’hôte Docker. */
export function mountImagesRoutes(
  app: Hono<{ Variables: VariablesMoteurHttp }>,
  engine: ContainerEngine,
): void {
  app.get("/images", async (c) => {
    try {
      const docker = engine.raw;
      const liste = await docker.listImages();
      const images: ImageLocaleApi[] = [];
      for (const entree of liste) {
        const taille = entree.Size ?? 0;
        const etiquettes = entree.RepoTags;
        if (!etiquettes?.length) {
          const court = entree.Id?.replace(/^sha256:/, "").slice(0, 12) ?? "inconnu";
          images.push({
            nom: "<sans-depot>",
            tag: court,
            taille,
          });
          continue;
        }
        for (const rt of etiquettes) {
          const { nom, tag } = nomEtTagDepuisRepoTag(rt);
          images.push({ nom, tag, taille });
        }
      }
      return c.json({ images });
    } catch (err) {
      const response = tryRespondWithEngineError(c, err);
      if (response) return response;
      throw err;
    }
  });
}
