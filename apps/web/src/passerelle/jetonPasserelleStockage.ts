const CLE_JWT = "kidopanel-jwt";
const CLE_MODE = "kidopanel-mode";
const LEGACY_LAB_JWT = "kido-panel-lab-jwt";

/** Valeur du marqueur lorsque le jeton vit dans sessionStorage (fermeture d’onglet). */
const MODE_SESSION = "session";
/** Valeur du marqueur lorsque le jeton vit dans localStorage (persistance explicite). */
const MODE_PERSIST = "persist";

function retirerMarqueurEtJetonSession(): void {
  try {
    sessionStorage.removeItem(CLE_MODE);
    sessionStorage.removeItem(CLE_JWT);
  } catch {
    /* navigateur sans stockage session */
  }
}

function retirerMarqueurEtJetonPersist(): void {
  try {
    localStorage.removeItem(CLE_MODE);
    localStorage.removeItem(CLE_JWT);
  } catch {
    /* navigateur sans stockage local */
  }
}

function retirerLegacyLab(): void {
  try {
    localStorage.removeItem(LEGACY_LAB_JWT);
  } catch {
    /* indisponible */
  }
}

/**
 * Efface toutes les variantes connues du jeton (session, persistance, clé historique du lab).
 */
export function effacerToutJetonPasserelle(): void {
  retirerMarqueurEtJetonSession();
  retirerMarqueurEtJetonPersist();
  retirerLegacyLab();
}

/**
 * Lit le jeton actif : session prioritaire, puis persistance, puis clé historique du lab.
 */
export function lireJetonPasserelle(): string {
  try {
    if (sessionStorage.getItem(CLE_MODE) === MODE_SESSION) {
      return sessionStorage.getItem(CLE_JWT) ?? "";
    }
  } catch {
    /* ignoré */
  }
  try {
    if (localStorage.getItem(CLE_MODE) === MODE_PERSIST) {
      return localStorage.getItem(CLE_JWT) ?? "";
    }
  } catch {
    /* ignoré */
  }
  try {
    return localStorage.getItem(LEGACY_LAB_JWT) ?? "";
  } catch {
    return "";
  }
}

/**
 * Enregistre le jeton après authentification depuis l’interface principale.
 * @param seSouvenir si vrai, persistance locale ; sinon stockage limité à l’onglet courant.
 */
export function enregistrerJetonApresAuthentificationPanel(
  jeton: string,
  seSouvenir: boolean,
): void {
  effacerToutJetonPasserelle();
  const valeur = jeton.trim();
  if (valeur === "") {
    return;
  }
  try {
    if (seSouvenir) {
      localStorage.setItem(CLE_MODE, MODE_PERSIST);
      localStorage.setItem(CLE_JWT, valeur);
    } else {
      sessionStorage.setItem(CLE_MODE, MODE_SESSION);
      sessionStorage.setItem(CLE_JWT, valeur);
    }
  } catch {
    /* stockage refusé : l’appelant gère l’absence de persistance */
  }
}

/**
 * Persistance explicite pour le lab : localStorage typé, sans toucher au mode session du panel.
 */
export function enregistrerJetonDepuisLabPersistant(jeton: string): void {
  const valeur = jeton.trim();
  if (valeur === "") {
    effacerToutJetonPasserelle();
    return;
  }
  try {
    retirerMarqueurEtJetonSession();
    retirerLegacyLab();
    localStorage.setItem(CLE_MODE, MODE_PERSIST);
    localStorage.setItem(CLE_JWT, valeur);
  } catch {
    /* indisponible */
  }
}
