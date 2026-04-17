import { CHEMIN_PROXY_PASSERELLE_DEV } from "../config/chemin-proxy-passerelle-dev.js";

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
