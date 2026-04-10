/**
 * Écrit une ligne de journal structurée JSON sur la sortie standard pour agrégation sans outil externe.
 */

export type NiveauJournal = "info" | "warn" | "error";

export type EntreeJournalPasserelle = {
  niveau: NiveauJournal;
  message: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

/** Sérialise une entrée avec horodatage ISO 8601 et le nom du service passerelle. */
export function journaliserPasserelle(entree: EntreeJournalPasserelle): void {
  const ligne: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    niveau: entree.niveau,
    service: "gateway",
    message: entree.message,
  };
  if (entree.requestId !== undefined && entree.requestId.length > 0) {
    ligne.requestId = entree.requestId;
  }
  if (
    entree.metadata !== undefined &&
    Object.keys(entree.metadata).length > 0
  ) {
    ligne.metadata = entree.metadata;
  }
  console.log(JSON.stringify(ligne));
}

/**
 * Journalise une erreur avec trace de pile lorsque l’exception en fournit une,
 * sans répéter de données sensibles dans le message.
 */
export function journaliserErreurPasserelle(
  message: string,
  erreur: unknown,
  requestId?: string,
): void {
  const meta: Record<string, unknown> = {};
  if (erreur instanceof Error) {
    if (erreur.message.length > 0) {
      meta.erreurMessage = erreur.message;
    }
    if (erreur.stack !== undefined) {
      meta.stack = erreur.stack;
    }
  } else {
    meta.erreur = String(erreur);
  }
  journaliserPasserelle({
    niveau: "error",
    message,
    requestId,
    metadata: meta,
  });
}
