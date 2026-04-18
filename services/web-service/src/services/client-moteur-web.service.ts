const EN_TETE_CORRELATION = "X-Request-Id";

export type CorpsCreationConteneurMoteur = Record<string, unknown>;

/**
 * Client HTTP vers le container-engine pour le service web (aucune dépendance Docker locale).
 */
export class ClientMoteurWebHttp {
  constructor(private readonly urlBaseMoteur: string) {}

  private construireUrl(chemin: string): string {
    const base = this.urlBaseMoteur.replace(/\/+$/, "");
    const suffixe = chemin.startsWith("/") ? chemin : `/${chemin}`;
    return `${base}${suffixe}`;
  }

  async posterCreation(
    corps: CorpsCreationConteneurMoteur,
    identifiantRequete: string,
  ): Promise<Response> {
    return fetch(this.construireUrl("/containers"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [EN_TETE_CORRELATION]: identifiantRequete,
      },
      body: JSON.stringify(corps),
    });
  }

  async posterDemarrage(
    idConteneurDocker: string,
    identifiantRequete: string,
  ): Promise<Response> {
    return fetch(
      this.construireUrl(`/containers/${encodeURIComponent(idConteneurDocker)}/start`),
      {
        method: "POST",
        headers: {
          [EN_TETE_CORRELATION]: identifiantRequete,
        },
      },
    );
  }

  async posterArret(
    idConteneurDocker: string,
    identifiantRequete: string,
  ): Promise<Response> {
    return fetch(
      this.construireUrl(`/containers/${encodeURIComponent(idConteneurDocker)}/stop`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [EN_TETE_CORRELATION]: identifiantRequete,
        },
        body: JSON.stringify({}),
      },
    );
  }

  async supprimerConteneur(
    idConteneurDocker: string,
    identifiantRequete: string,
  ): Promise<Response> {
    const url = new URL(
      this.construireUrl(`/containers/${encodeURIComponent(idConteneurDocker)}`),
    );
    url.searchParams.set("force", "true");
    return fetch(url.toString(), {
      method: "DELETE",
      headers: {
        [EN_TETE_CORRELATION]: identifiantRequete,
      },
    });
  }

  async obtenirListeConteneurs(identifiantRequete: string): Promise<Response> {
    const url = new URL(this.construireUrl("/containers"));
    url.searchParams.set("all", "true");
    return fetch(url.toString(), {
      method: "GET",
      headers: {
        [EN_TETE_CORRELATION]: identifiantRequete,
      },
    });
  }

  /**
   * Retourne l’IPv4 sur `kidopanel-network` pour un identifiant Docker connu du moteur.
   */
  async obtenirIpv4ReseauKidopanelPourConteneur(
    idConteneurDocker: string,
    identifiantRequete: string,
  ): Promise<string | undefined> {
    const reponse = await this.obtenirListeConteneurs(identifiantRequete);
    const texte = await reponse.text();
    if (!reponse.ok) {
      return undefined;
    }
    try {
      const parse = JSON.parse(texte) as {
        containers?: Array<{ id?: string; ipv4ReseauKidopanel?: string }>;
      };
      const liste = parse.containers ?? [];
      const ligne = liste.find(
        (c) =>
          typeof c.id === "string" &&
          (c.id === idConteneurDocker || c.id.startsWith(idConteneurDocker)),
      );
      const ip = ligne?.ipv4ReseauKidopanel;
      return typeof ip === "string" && ip.length > 0 ? ip : undefined;
    } catch {
      return undefined;
    }
  }

  async posterExecDansConteneur(
    idConteneurDocker: string,
    corps: { cmd: string[]; stdinUtf8?: string },
    identifiantRequete: string,
  ): Promise<Response> {
    return fetch(
      this.construireUrl(`/containers/${encodeURIComponent(idConteneurDocker)}/exec`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [EN_TETE_CORRELATION]: identifiantRequete,
        },
        body: JSON.stringify(corps),
      },
    );
  }

  async relayerFluxJournauxConteneurVersMoteur(params: {
    idConteneurDocker: string;
    parametresRequete: URLSearchParams;
    identifiantRequete: string;
    signalAnnulation: AbortSignal;
  }): Promise<Response> {
    const url = new URL(
      this.construireUrl(
        `/containers/${encodeURIComponent(params.idConteneurDocker)}/logs/stream`,
      ),
    );
    params.parametresRequete.forEach((valeur, cle) => {
      url.searchParams.set(cle, valeur);
    });
    return fetch(url.toString(), {
      method: "GET",
      headers: {
        [EN_TETE_CORRELATION]: params.identifiantRequete,
        Accept: "text/event-stream",
      },
      signal: params.signalAnnulation,
    });
  }
}
