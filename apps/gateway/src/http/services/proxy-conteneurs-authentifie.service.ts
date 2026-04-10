import type { Context } from "hono";
import type { ContainerOwnershipRepository } from "../../auth/container-ownership-repository.prisma.js";
import {
  filtrerConteneursParProprieteUtilisateur,
  verifyContainerOwnership,
} from "../../auth/verify-container-ownership.js";
import type { UtilisateurPublic } from "../../auth/user.types.js";
import { journaliserPasserelle } from "../../observabilite/journal-json.js";
import { forwardRequestToContainerEngine } from "../proxy/container-engine-proxy.js";
import type { VariablesGateway } from "../types/gateway-variables.js";
import { proxyFluxJournauxSseAvecPropriete } from "./proxy-flux-journaux-sse.service.js";

type ListeConteneursAmont = { containers: Array<{ id: string }> };

type CreationConteneurAmont = { id: string; warnings?: string[] };

/** Indique une requête `GET /containers/:id/logs/stream` (SSE), sans confondre avec un suffixe du type `logs/streaming`. */
function estRequeteFluxJournauxSse(methode: string, pathname: string): boolean {
  if (methode !== "GET") {
    return false;
  }
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length === 4 &&
    segments[0] === "containers" &&
    segments[2] === "logs" &&
    segments[3] === "stream"
  );
}

function reponseJsonErreur(
  code: string,
  message: string,
  statut: number,
): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status: statut,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Applique le cloisonnement par utilisateur sur le relais HTTP vers le container-engine :
 * filtrage des listes, contrôle d’accès sur :id, enregistrement de propriété après création.
 */
function estRouteRacineConteneurs(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 && segments[0] === "containers";
}

function journaliserRefusAccesConteneur(
  c: Context<{ Variables: VariablesGateway }>,
  metadata: Record<string, unknown>,
): void {
  journaliserPasserelle({
    niveau: "warn",
    message: "acces_conteneur_refuse",
    requestId: c.get("requestId"),
    metadata,
  });
}

export async function proxyConteneursAvecPropriete(
  c: Context<{ Variables: VariablesGateway }>,
  utilisateur: UtilisateurPublic,
  depotPropriete: ContainerOwnershipRepository,
): Promise<Response> {
  const methode = c.req.method;
  const chemin = new URL(c.req.url).pathname;

  if (estRouteRacineConteneurs(chemin)) {
    if (methode === "GET") {
      const amont = await forwardRequestToContainerEngine(c);
      if (!amont.ok) {
        if (amont.status >= 500) {
          journaliserPasserelle({
            niveau: "error",
            message: "proxy_moteur_reponse_5xx",
            requestId: c.get("requestId"),
            metadata: { statut: amont.status, chemin },
          });
        }
        return amont;
      }
      const brut = await amont.text();
      let parse: ListeConteneursAmont;
      try {
        parse = JSON.parse(brut) as ListeConteneursAmont;
      } catch {
        return reponseJsonErreur(
          "AMONT_INVALIDE",
          "Réponse du moteur de conteneurs illisible pour la liste.",
          502,
        );
      }
      const liste = Array.isArray(parse.containers) ? parse.containers : [];
      const filtrees = await filtrerConteneursParProprieteUtilisateur(
        depotPropriete,
        utilisateur.id,
        liste,
      );
      return new Response(JSON.stringify({ containers: filtrees }), {
        status: amont.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (methode === "POST") {
      const amont = await forwardRequestToContainerEngine(c);
      if (!amont.ok && amont.status >= 500) {
        journaliserPasserelle({
          niveau: "error",
          message: "proxy_moteur_reponse_5xx",
          requestId: c.get("requestId"),
          metadata: { statut: amont.status, chemin },
        });
      }
      if (amont.status === 201) {
        const brut = await amont.text();
        let parse: CreationConteneurAmont;
        try {
          parse = JSON.parse(brut) as CreationConteneurAmont;
        } catch {
          return new Response(brut, {
            status: amont.status,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (typeof parse.id === "string" && parse.id.length > 0) {
          await depotPropriete.addOwnership(utilisateur.id, parse.id);
        }
        return new Response(JSON.stringify(parse), {
          status: amont.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(amont.body, {
        status: amont.status,
        headers: amont.headers,
      });
    }
  }

  let idConteneurPourSuppression: string | undefined;

  if (!estRouteRacineConteneurs(chemin)) {
    const idParam = (c.req.param("id") ?? "").trim();
    if (idParam.length === 0) {
      journaliserRefusAccesConteneur(c, {
        raison: "identifiant_conteneur_absent",
        utilisateurId: utilisateur.id,
        chemin,
      });
      return reponseJsonErreur(
        "CONTAINER_ACCESS_DENIED",
        "Ce conteneur n’existe pas pour votre compte ou ne vous appartient pas.",
        403,
      );
    }
    const autorise = await verifyContainerOwnership(
      depotPropriete,
      utilisateur.id,
      idParam,
    );
    if (!autorise) {
      journaliserRefusAccesConteneur(c, {
        raison: "propriete_non_verifiee",
        utilisateurId: utilisateur.id,
        idConteneurDemande: idParam,
        chemin,
      });
      return reponseJsonErreur(
        "CONTAINER_ACCESS_DENIED",
        "Ce conteneur n’existe pas pour votre compte ou ne vous appartient pas.",
        403,
      );
    }
    idConteneurPourSuppression = idParam;
  }

  if (
    estRequeteFluxJournauxSse(methode, chemin) &&
    idConteneurPourSuppression !== undefined
  ) {
    return proxyFluxJournauxSseAvecPropriete(
      c,
      utilisateur.id,
      idConteneurPourSuppression,
      depotPropriete,
    );
  }

  const amont = await forwardRequestToContainerEngine(c);
  if (!amont.ok && amont.status >= 500) {
    journaliserPasserelle({
      niveau: "error",
      message: "proxy_moteur_reponse_5xx",
      requestId: c.get("requestId"),
      metadata: { statut: amont.status, chemin },
    });
  }

  if (
    methode === "DELETE" &&
    amont.status >= 200 &&
    amont.status < 300 &&
    idConteneurPourSuppression !== undefined
  ) {
    await depotPropriete.removeOwnershipForUser(
      utilisateur.id,
      idConteneurPourSuppression,
    );
  }

  return amont;
}
