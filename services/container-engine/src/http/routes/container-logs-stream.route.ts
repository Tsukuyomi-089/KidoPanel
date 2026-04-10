import type { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { StringDecoder } from "node:string_decoder";
import type { ContainerEngine } from "../../container-engine.js";
import { tryRespondWithEngineError } from "../respond-route-error.js";
import {
  containerIdParamSchema,
  containerLogsQuerySchema,
} from "../schemas/container-api.schemas.js";

type MorceauFlux = Buffer | string | Uint8Array;

function morceauVersBuffer(m: MorceauFlux): Buffer {
  if (Buffer.isBuffer(m)) {
    return m;
  }
  if (typeof m === "string") {
    return Buffer.from(m);
  }
  return Buffer.from(m);
}

/**
 * Route SSE : relaie le flux Docker `follow` en événements `data` JSON par ligne (`{ "line": "..." }`).
 */
export function mountContainerLogStreamRoute(
  app: Hono,
  engine: ContainerEngine,
): void {
  app.get(
    "/containers/:id/logs/stream",
    zValidator("param", containerIdParamSchema),
    zValidator("query", containerLogsQuerySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const query = c.req.valid("query");
      try {
        const flux = await engine.openLogFollowStream(id, {
          tail: query.tail,
          timestamps: query.timestamps,
        });
        return streamSSE(c, async (sse) => {
          const requeteEntrante = c.req.raw;
          const fermerSurArretClient = (): void => {
            flux.fermer();
          };
          requeteEntrante.signal.addEventListener("abort", fermerSurArretClient);
          const minuteurPing = setInterval(() => {
            void sse.writeSSE({ event: "ping", data: "1" }).catch(() => {});
          }, 25_000);
          try {
            const decodeur = new StringDecoder("utf8");
            let reste = "";
            const iterable = flux.readable as AsyncIterable<MorceauFlux>;
            for await (const morceau of iterable) {
              reste += decodeur.write(morceauVersBuffer(morceau));
              const lignes = reste.split("\n");
              reste = lignes.pop() ?? "";
              for (const ligne of lignes) {
                await sse.writeSSE({
                  data: JSON.stringify({ line: ligne }),
                });
              }
            }
            reste += decodeur.end();
            if (reste.length > 0) {
              await sse.writeSSE({
                data: JSON.stringify({ line: reste }),
              });
            }
          } catch (errFlux) {
            const msg =
              errFlux instanceof Error ? errFlux.message : String(errFlux);
            await sse.writeSSE({
              event: "error",
              data: JSON.stringify({ message: msg }),
            });
          } finally {
            clearInterval(minuteurPing);
            requeteEntrante.signal.removeEventListener(
              "abort",
              fermerSurArretClient,
            );
            flux.fermer();
          }
        });
      } catch (err) {
        const response = tryRespondWithEngineError(c, err);
        if (response) {
          return response;
        }
        throw err;
      }
    },
  );
}
