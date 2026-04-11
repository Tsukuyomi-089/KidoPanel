import { CHEMIN_PROXY_PASSERELLE_DEV } from "../config/chemin-proxy-passerelle-dev.js";
import { formaterErreurReseauFetch } from "./passerelleErreursAffichageLab.js";

function hoteEstLoopback(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "127.0.0.1" || h === "localhost" || h === "[::1]";
}

function urlDepuisVariableEnv(): string | null {
  const b = import.meta.env.VITE_GATEWAY_BASE_URL?.trim();
  if (!b || b.length === 0) {
    return null;
  }
  return b.replace(/\/$/, "");
}

/**
 * `http://127.0.0.1:3000` (ou localhost) inliné par Vite : depuis un onglet servi par
 * `http://IP:5173`, le navigateur envoie la requête au port 3000 de la machine du client,
 * pas du serveur — d’où « Failed to fetch » alors que la passerelle écoute sur le VPS.
 */
function envLoopbackIncompatibleAvecPage(urlAbsolue: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const u = new URL(urlAbsolue);
    if (!hoteEstLoopback(u.hostname)) {
      return false;
    }
    return !hoteEstLoopback(window.location.hostname);
  } catch {
    return false;
  }
}

/**
 * `VITE_GATEWAY_BASE_URL=http(s)://<même hôte>:3000` en dev : souvent copié-collé pour « corriger »
 * l’accès distant, alors que le pare-feu n’ouvre pas le 3000 — le proxy Vite suffit. On ignore cette
 * valeur en dev (si le proxy est autorisé) pour forcer `/__kidopanel_gateway`.
 * Une API sur un autre hôte ou un port ≠ 3000 reste prise en compte.
 */
function envDevMemeHotePortPasserelleStandard(urlAbsolue: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const u = new URL(urlAbsolue);
    const pageH = window.location.hostname;
    if (pageH === "" || u.hostname !== pageH) {
      return false;
    }
    if (u.port !== "3000") {
      return false;
    }
    const chemin = u.pathname.replace(/\/$/, "") || "/";
    return chemin === "/";
  } catch {
    return false;
  }
}

function urlPasserelleHorsEnvSurMemeHoteQueLaPage(): string {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:3000";
  }
  const h = window.location.hostname;
  if (h === "" || hoteEstLoopback(h)) {
    return "http://127.0.0.1:3000";
  }
  const scheme = window.location.protocol === "https:" ? "https" : "http";
  return `${scheme}://${h}:3000`;
}

/**
 * Relais Vite vers la passerelle (127.0.0.1:3000 côté serveur) : explicite via
 * `VITE_GATEWAY_DEV_USE_PROXY`, ou automatique en dev si la page n’est pas en loopback
 * (évite d’exposer le port 3000 sur Internet pour `pnpm dev` distant).
 */
function devPasserelleUtiliseProxyVite(): boolean {
  const v = import.meta.env.VITE_GATEWAY_DEV_USE_PROXY?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no" || v === "off") {
    return false;
  }
  if (v === "1" || v === "true" || v === "yes" || v === "on") {
    return true;
  }
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }
  const h = window.location.hostname;
  return h !== "" && !hoteEstLoopback(h);
}

/**
 * En dev sans `VITE_GATEWAY_BASE_URL` : proxy Vite si activé ou hôte distant,
 * sinon URL directe (loopback ou même hôte:3000).
 */
function urlPasserelleDevSansVariableExplicite(): string {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:3000";
  }
  if (devPasserelleUtiliseProxyVite()) {
    return `${window.location.origin}${CHEMIN_PROXY_PASSERELLE_DEV}`;
  }
  return urlPasserelleHorsEnvSurMemeHoteQueLaPage();
}

/**
 * Base des appels à la passerelle.
 * Si le panel est ouvert avec une adresse non-loopback (ex. `http://IP:5173`), en **build de dev**
 * on utilise par défaut le proxy Vite (`/__kidopanel_gateway`) pour joindre la passerelle sur le serveur,
 * sans ouvrir le port 3000 au WAN. En **preview / prod**, ou si `VITE_GATEWAY_DEV_USE_PROXY=0`, l’API est
 * `http(s)://<même hôte>:3000` (ou `VITE_GATEWAY_BASE_URL`). En local : proxy explicite, variable d’env, ou 127.0.0.1:3000.
 */
export function urlBasePasserelle(): string {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h !== "" && !hoteEstLoopback(h)) {
      let depuisEnvHorsLocal = urlDepuisVariableEnv();
      if (
        depuisEnvHorsLocal !== null &&
        envLoopbackIncompatibleAvecPage(depuisEnvHorsLocal)
      ) {
        depuisEnvHorsLocal = null;
      }
      if (
        import.meta.env.DEV &&
        devPasserelleUtiliseProxyVite() &&
        depuisEnvHorsLocal !== null &&
        envDevMemeHotePortPasserelleStandard(depuisEnvHorsLocal)
      ) {
        depuisEnvHorsLocal = null;
      }
      if (depuisEnvHorsLocal !== null) {
        return depuisEnvHorsLocal;
      }
      if (import.meta.env.DEV && devPasserelleUtiliseProxyVite()) {
        return `${window.location.origin}${CHEMIN_PROXY_PASSERELLE_DEV}`;
      }
      const scheme = window.location.protocol === "https:" ? "https" : "http";
      return `${scheme}://${h}:3000`;
    }
  }

  let depuisEnv = urlDepuisVariableEnv();
  if (depuisEnv !== null && envLoopbackIncompatibleAvecPage(depuisEnv)) {
    depuisEnv = null;
  }

  if (import.meta.env.DEV && typeof window !== "undefined") {
    if (depuisEnv === null) {
      return urlPasserelleDevSansVariableExplicite();
    }
    return depuisEnv;
  }

  if (depuisEnv !== null) {
    return depuisEnv;
  }

  return urlPasserelleHorsEnvSurMemeHoteQueLaPage();
}

const CLE_JWT_LAB = "kido-panel-lab-jwt";

/** Lit le jeton JWT stocké pour les appels à la passerelle. */
export function lireJetonStockage(): string {
  try {
    return localStorage.getItem(CLE_JWT_LAB) ?? "";
  } catch {
    return "";
  }
}

/** Enregistre ou efface le jeton JWT (chaîne vide supprime la clé). */
export function enregistrerJetonStockage(jeton: string): void {
  try {
    if (jeton.trim() === "") {
      localStorage.removeItem(CLE_JWT_LAB);
    } else {
      localStorage.setItem(CLE_JWT_LAB, jeton);
    }
  } catch {
    /* stockage indisponible : l’appelant peut saisir le jeton en session uniquement */
  }
}

export type CorpsErreurPasserelle = {
  statutHttp: number;
  /** Libellé HTTP renvoyé par le navigateur (ex. « Not Found »), vide si absent. */
  libelleStatut?: string;
  texteBrut: string;
  jsonParse?: unknown;
};

/** Construit une représentation lisible d’une réponse HTTP en erreur. */
export async function corpsErreurDepuisReponse(
  reponse: Response,
): Promise<CorpsErreurPasserelle> {
  const texteBrut = await reponse.text();
  let jsonParse: unknown;
  try {
    jsonParse = JSON.parse(texteBrut) as unknown;
  } catch {
    /* corps non JSON */
  }
  const libelleStatut = reponse.statusText.trim();
  return {
    statutHttp: reponse.status,
    ...(libelleStatut !== "" ? { libelleStatut } : {}),
    texteBrut,
    jsonParse,
  };
}

/** Formate une erreur HTTP pour affichage dans l’interface de test. */
export function formaterErreurAffichage(corps: CorpsErreurPasserelle): string {
  const enteteStatut =
    corps.libelleStatut !== undefined && corps.libelleStatut !== ""
      ? `HTTP ${corps.statutHttp} ${corps.libelleStatut}`
      : `HTTP ${corps.statutHttp}`;
  const lignes = [enteteStatut];
  if (corps.jsonParse !== undefined) {
    lignes.push(JSON.stringify(corps.jsonParse, null, 2));
  } else if (corps.texteBrut.trim() !== "") {
    lignes.push(corps.texteBrut);
  }
  return lignes.join("\n");
}

/** Assemble l’URL absolue d’un chemin sur la passerelle (diagnostic d’erreur). */
export function composerUrlPasserelle(cheminRelatif: string): string {
  const base = urlBasePasserelle();
  const chemin = cheminRelatif.startsWith("/")
    ? cheminRelatif
    : `/${cheminRelatif}`;
  return `${base}${chemin}`;
}

type OptionsAppel = RequestInit & {
  /** Surcharge du jeton (sinon lecture du stockage local). */
  jetonBearer?: string;
};

/** Effectue une requête HTTP vers la passerelle avec en-tête Authorization si un jeton est disponible. */
export async function appelerPasserelle(
  cheminRelatif: string,
  options: OptionsAppel = {},
): Promise<Response> {
  const base = urlBasePasserelle();
  const chemin = cheminRelatif.startsWith("/")
    ? cheminRelatif
    : `/${cheminRelatif}`;
  const url = `${base}${chemin}`;
  const { jetonBearer, headers: enTetesInitiaux, ...reste } = options;
  const enTetes = new Headers(enTetesInitiaux);
  if (reste.body !== undefined && !enTetes.has("Content-Type")) {
    enTetes.set("Content-Type", "application/json");
  }
  const jeton = jetonBearer ?? lireJetonStockage();
  if (jeton.trim() !== "") {
    enTetes.set("Authorization", `Bearer ${jeton}`);
  }
  try {
    return await fetch(url, {
      ...reste,
      headers: enTetes,
      mode: "cors",
      cache: "no-store",
    });
  } catch (erreur) {
    throw new Error(formaterErreurReseauFetch(url, erreur));
  }
}
