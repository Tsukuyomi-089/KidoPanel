import { urlBasePasserelle } from "./passerelleClient.js";
import { formaterErreurReseauFetch } from "./passerelleErreursAffichageLab.js";

/** Extrait un libellé lisible du corps JSON 502 UPSTREAM de la passerelle. */
async function detailCorpsHealthEchoue(reponse: Response): Promise<string> {
  try {
    const brut = await reponse.clone().text();
    if (brut.trim() === "") {
      return "";
    }
    const parse = JSON.parse(brut) as {
      error?: { code?: string; message?: string };
    };
    if (
      parse.error?.code === "UPSTREAM_UNAVAILABLE" &&
      typeof parse.error.message === "string"
    ) {
      return parse.error.message;
    }
    return brut.length > 800 ? `${brut.slice(0, 800)}…` : brut;
  } catch {
    return "";
  }
}

/** Indique si GET /health répond ; utile pour diagnostiquer avant login. */
export async function sondageSantePasserelle(): Promise<{
  joignable: boolean;
  message: string;
}> {
  const base = urlBasePasserelle();
  const urlPasserelleSeule = `${base}/health/gateway`;
  const urlHealthComplet = `${base}/health`;

  try {
    const reponsePasserelle = await fetch(urlPasserelleSeule, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
    });
    if (!reponsePasserelle.ok) {
      return {
        joignable: false,
        message: [
          "La passerelle HTTP ne répond pas correctement sur /health/gateway.",
          `URL : ${urlPasserelleSeule}`,
          `HTTP ${reponsePasserelle.status}`,
        ].join("\n"),
      };
    }
  } catch (erreur) {
    return {
      joignable: false,
      message: formaterErreurReseauFetch(urlPasserelleSeule, erreur),
    };
  }

  try {
    const reponse = await fetch(urlHealthComplet, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
    });
    if (reponse.ok) {
      return {
        joignable: true,
        message: `Passerelle et moteur OK — ${urlHealthComplet} (HTTP ${reponse.status})`,
      };
    }
    const detail = await detailCorpsHealthEchoue(reponse);
    return {
      joignable: false,
      message: [
        "La passerelle répond ; le container-engine (Docker) ne répond pas sur /health.",
        `URL testée : ${urlHealthComplet}`,
        `HTTP ${reponse.status}`,
        "",
        "Côté serveur : démarrer le processus container-engine (port 8787 par défaut, variable racine CONTAINER_ENGINE_BASE_URL pour la passerelle).",
        "Journal : infra/logs/moteur.log",
        ...(detail !== "" ? ["", `Détail passerelle : ${detail}`] : []),
      ].join("\n"),
    };
  } catch (erreur) {
    return {
      joignable: false,
      message: formaterErreurReseauFetch(urlHealthComplet, erreur),
    };
  }
}
