import type { Context } from "hono";
import type { ContainerOwnershipRepository } from "../../auth/container-ownership-repository.prisma.js";
import { verifyContainerOwnership } from "../../auth/verify-container-ownership.js";
import { forwardRequestToContainerEngine } from "../proxy/container-engine-proxy.js";

const INTERVALLE_VERIF_PROPRIETE_MS = 2_000;

/**
 * Relaie le corps SSE du moteur tout en coupant le flux si la propriété du conteneur n’est plus valide en base.
 */
export async function proxyFluxJournauxSseAvecPropriete(
  c: Context,
  utilisateurId: string,
  containerId: string,
  depotPropriete: ContainerOwnershipRepository,
): Promise<Response> {
  const amont = await forwardRequestToContainerEngine(c);
  if (!amont.ok || !amont.body) {
    return amont;
  }

  const entetesSortie = new Headers(amont.headers);
  entetesSortie.delete("content-length");
  entetesSortie.delete("transfer-encoding");

  const lecteurAmont = amont.body.getReader();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const redacteur = writable.getWriter();

  let pompageActif = true;
  const verification = setInterval(() => {
    void (async () => {
      if (!pompageActif) {
        return;
      }
      const autorise = await verifyContainerOwnership(
        depotPropriete,
        utilisateurId,
        containerId,
      );
      if (!autorise) {
        pompageActif = false;
        clearInterval(verification);
        await lecteurAmont.cancel();
      }
    })();
  }, INTERVALLE_VERIF_PROPRIETE_MS);

  void (async () => {
    try {
      for (;;) {
        const { value, done } = await lecteurAmont.read();
        if (done || !pompageActif) {
          break;
        }
        if (value) {
          await redacteur.write(value);
        }
      }
    } catch {
      // annulation côté client ou propriété révoquée
    } finally {
      pompageActif = false;
      clearInterval(verification);
      await redacteur.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    status: amont.status,
    headers: entetesSortie,
  });
}
