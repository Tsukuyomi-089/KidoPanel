import type { GameType } from "@kidopanel/database";
import type { GabaritJeuCatalogueInstance } from "@kidopanel/container-catalog";
import { trouverGabaritJeuParId } from "@kidopanel/container-catalog";
import { ErreurMetierInstanceJeux } from "../erreurs/erreurs-metier-instance-jeu.js";

/**
 * Résout l’identifiant de gabarit catalogue à partir du type de jeu Prisma.
 */
export function resoudreGabaritJeuPourType(
  type: GameType,
): GabaritJeuCatalogueInstance {
  const idGabarit = MAPPING_TYPE_JEU_VERS_IDENTIFIANT_GABARIT[type];
  if (idGabarit === undefined || idGabarit === "") {
    throw new ErreurMetierInstanceJeux(
      "TYPE_JEU_NON_PRIS_EN_CHARGE",
      `Le type de jeu « ${type} » n’a pas encore de gabarit catalogue exploitable.`,
      422,
      { gameType: type },
    );
  }
  const gabarit = trouverGabaritJeuParId(idGabarit);
  if (!gabarit) {
    throw new ErreurMetierInstanceJeux(
      "TYPE_JEU_NON_PRIS_EN_CHARGE",
      `Gabarit catalogue introuvable pour « ${idGabarit} ».`,
      500,
      { gameType: type },
    );
  }
  return gabarit;
}

const MAPPING_TYPE_JEU_VERS_IDENTIFIANT_GABARIT: Partial<
  Record<GameType, string>
> = {
  MINECRAFT_JAVA: "tmpl-jeu-minecraft-java",
  MINECRAFT_BEDROCK: "tmpl-jeu-minecraft-bedrock",
  VALHEIM: "tmpl-jeu-valheim",
  TERRARIA: "tmpl-jeu-terraria",
  SATISFACTORY: "tmpl-jeu-satisfactory",
  CSGO: "tmpl-jeu-cs2",
  ARK: "tmpl-jeu-ark",
};
