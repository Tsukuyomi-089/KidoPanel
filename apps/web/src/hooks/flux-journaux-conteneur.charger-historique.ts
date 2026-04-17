/**
 * Récupère les dernières lignes via `GET /containers/:id/logs` (même principe que l’onglet Logs de Portainer avant le suivi temps réel).
 */
export async function chargerLignesHistoriqueJournauxConteneur(options: {
  urlBasePasserelle: string;
  idConteneur: string;
  jetonBearer: string;
  tailEntrees?: number;
  horodatageDocker?: boolean;
  signal: AbortSignal;
}): Promise<string[]> {
  const base = options.urlBasePasserelle.replace(/\/$/, "");
  const urlHistorique = new URL(
    `${base}/containers/${encodeURIComponent(options.idConteneur)}/logs`,
  );
  if (options.tailEntrees !== undefined) {
    urlHistorique.searchParams.set("tail", String(options.tailEntrees));
  }
  if (options.horodatageDocker) {
    urlHistorique.searchParams.set("timestamps", "true");
  }
  const reponseHistorique = await fetch(urlHistorique.toString(), {
    method: "GET",
    mode: "cors",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${options.jetonBearer}`,
      Accept: "application/json",
    },
    signal: options.signal,
  });
  if (!reponseHistorique.ok) {
    return [];
  }
  const corps = (await reponseHistorique.json()) as { logs?: string };
  const brut = typeof corps.logs === "string" ? corps.logs : "";
  const morceaux = brut.split(/\r?\n/);
  if (morceaux.length > 0 && morceaux[morceaux.length - 1] === "") {
    morceaux.pop();
  }
  return morceaux;
}
