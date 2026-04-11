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
      const lignes = [
        "La requête vers la passerelle via le proxy Vite a échoué.",
        `URL : ${urlPasserelleSeule}`,
        `HTTP ${reponsePasserelle.status}`,
      ];
      if (reponsePasserelle.status === 502) {
        lignes.push(
          "",
          "Un 502 sur ce chemin signifie en pratique : le serveur Vite n’a pas réussi à joindre la cible du proxy (par défaut http://127.0.0.1:3000 sur la machine où tourne Vite). Vérifier que la passerelle est démarrée, écoute le port 3000, et que `pnpm --filter gateway run build` a été exécuté après les mises à jour ; journal : infra/logs/passerelle.log.",
        );
      }
      return {
        joignable: false,
        message: lignes.join("\n"),
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
