import { z } from "zod";
import { MOTIF_NOM_RESEAU_BRIDGE_UTILISATEUR_KIDOPANEL } from "../../docker/reseau-interne-kidopanel.constantes.js";

/** Corps pour la création d’un pont utilisateur (`POST /reseaux-internes`), aligné sur la passerelle KidoPanel. */
export const corpsCreationReseauInterneMoteurSchema = z.object({
  nomDocker: z.string().regex(MOTIF_NOM_RESEAU_BRIDGE_UTILISATEUR_KIDOPANEL),
  sousReseauCidr: z.string().min(9).max(64),
  passerelleIpv4: z.string().max(45).optional(),
  sansRouteVersInternetExterne: z.boolean(),
  pontBridgeDocker: z.string().max(15).optional(),
});

export type CorpsCreationReseauInterneMoteur = z.infer<
  typeof corpsCreationReseauInterneMoteurSchema
>;

/** Paramètres de requête pour la suppression d’un pont (`DELETE /reseaux-internes`). */
export const suppressionReseauInterneQuerySchema = z.object({
  nomDocker: z.string().min(3).max(256),
});
