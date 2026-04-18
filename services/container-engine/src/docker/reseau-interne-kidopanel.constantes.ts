/**
 * Nom du réseau bridge Docker partagé par les instances KidoPanel sur un même hôte moteur.
 */
export const NOM_RESEAU_BRIDGE_INTERNE_KIDOPANEL = "kidopanel-network";

/**
 * Motif autorisé pour les ponts créés par utilisateur (`kidopanel-unet-{uuid}`), aligné sur la passerelle.
 */
export const MOTIF_NOM_RESEAU_BRIDGE_UTILISATEUR_KIDOPANEL =
  /^kidopanel-unet-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
