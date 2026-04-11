import { serve } from "@hono/node-server";
import {
  journaliserErreurPasserelle,
  journaliserPasserelle,
} from "./observabilite/journal-json.js";
import { createGatewayApp } from "./http/create-gateway-app.js";

const port = Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000);
/** Adresse d’écoute : 0.0.0.0 = toutes les interfaces (accès distant au VPS) ; 127.0.0.1 = local seulement. */
const adresseEcoute =
  process.env.GATEWAY_LISTEN_HOST?.trim() || "0.0.0.0";

if (!Number.isFinite(port) || port < 1 || port > 65_535) {
  journaliserPasserelle({
    niveau: "error",
    message: "demarrage_refuse_port_invalide",
    metadata: { portBrut: process.env.GATEWAY_PORT ?? process.env.PORT },
  });
  process.exitCode = 1;
} else {
  let app;
  try {
    app = createGatewayApp();
  } catch (erreur) {
    journaliserErreurPasserelle(
      "demarrage_refuse_configuration",
      erreur,
    );
    process.exitCode = 1;
  }

  if (app) {
    serve(
      {
        fetch: app.fetch,
        port,
        hostname: adresseEcoute,
      },
      (info) => {
        journaliserPasserelle({
          niveau: "info",
          message: "passerelle_pret",
          metadata: {
            port: info.port,
            adresse: info.address,
          },
        });
      },
    );
  }
}
