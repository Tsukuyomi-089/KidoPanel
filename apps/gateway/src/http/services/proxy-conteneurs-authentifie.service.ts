import type { Context } from "hono";
import type { ContainerOwnershipRepository } from "../../auth/container-ownership-repository.prisma.js";
import { estConteneurPossede } from "../../auth/docker-identifiant-conteneur.js";
import type { UtilisateurPublic } from "../../auth/user.types.js";
import { forwardRequestToContainerEngine } from "../proxy/container-engine-proxy.js";

type ListeConteneursAmont = { containers: Array<{ id: string }> };

type CreationConteneurAmont = { id: string; warnings?: string[] };

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

export async function proxyConteneursAvecPropriete(
  c: Context,
  utilisateur: UtilisateurPublic,
  depotPropriete: ContainerOwnershipRepository,
): Promise<Response> {
  const methode = c.req.method;
  const chemin = new URL(c.req.url).pathname;

  if (estRouteRacineConteneurs(chemin)) {
    if (methode === "GET") {
      const amont = await forwardRequestToContainerEngine(c);
      if (!amont.ok) {
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
      const idsPossedes =
        await depotPropriete.getContainerIdsByUser(utilisateur.id);
      const filtrees = liste.filter((cont) =>
        estConteneurPossede(idsPossedes, cont.id),
      );
      return new Response(JSON.stringify({ containers: filtrees }), {
        status: amont.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (methode === "POST") {
      const amont = await forwardRequestToContainerEngine(c);
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

  const idParam = c.req.param("id");
  if (idParam) {
    const idsPossedes =
      await depotPropriete.getContainerIdsByUser(utilisateur.id);
    if (!estConteneurPossede(idsPossedes, idParam)) {
      return reponseJsonErreur(
        "CONTAINER_ACCESS_DENIED",
        "Ce conteneur n’existe pas pour votre compte ou ne vous appartient pas.",
        403,
      );
    }
  }

  const amont = await forwardRequestToContainerEngine(c);

  if (
    methode === "DELETE" &&
    amont.status >= 200 &&
    amont.status < 300 &&
    idParam
  ) {
    await depotPropriete.removeOwnership(idParam);
  }

  return amont;
}
