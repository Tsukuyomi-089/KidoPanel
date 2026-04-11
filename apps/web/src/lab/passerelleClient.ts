/** URL de base de la passerelle (variable Vite `VITE_GATEWAY_BASE_URL`, sans slash final). */
export function urlBasePasserelle(): string {
  const brute = import.meta.env.VITE_GATEWAY_BASE_URL?.trim();
  if (brute && brute.length > 0) {
    return brute.replace(/\/$/, "");
  }
  return "http://127.0.0.1:3000";
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
  return { statutHttp: reponse.status, texteBrut, jsonParse };
}

/** Formate une erreur HTTP pour affichage dans l’interface de test. */
export function formaterErreurAffichage(corps: CorpsErreurPasserelle): string {
  const lignes = [`HTTP ${corps.statutHttp}`];
  if (corps.jsonParse !== undefined) {
    lignes.push(JSON.stringify(corps.jsonParse, null, 2));
  } else if (corps.texteBrut.trim() !== "") {
    lignes.push(corps.texteBrut);
  }
  return lignes.join("\n");
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
  return fetch(url, { ...reste, headers: enTetes });
}
