/**
 * Écrit une ligne de journal structurée JSON sur la sortie standard pour diagnostic sans service externe.
 */

export type NiveauJournal = "info" | "warn" | "error";

export type EntreeJournalMoteur = {
  niveau: NiveauJournal;
  message: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

/** Sérialise une entrée avec horodatage ISO 8601 et le nom du service moteur. */
export function journaliserMoteur(entree: EntreeJournalMoteur): void {
  const ligne: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    niveau: entree.niveau,
    service: "container-engine",
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
 * Journalise une exception avec trace de pile lorsqu’elle est disponible,
 * pour le débogage serveur sans fuite vers le client HTTP.
 */
export function journaliserErreurMoteur(
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
  journaliserMoteur({
    niveau: "error",
    message,
    requestId,
    metadata: meta,
  });
}
