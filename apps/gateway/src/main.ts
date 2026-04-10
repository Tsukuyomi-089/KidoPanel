import { serve } from "@hono/node-server";
import {
  journaliserErreurPasserelle,
  journaliserPasserelle,
} from "./observabilite/journal-json.js";
import { createGatewayApp } from "./http/create-gateway-app.js";

const port = Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000);

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
      },
      (info) => {
        journaliserPasserelle({
          niveau: "info",
          message: "passerelle_pret",
          metadata: { port: info.port },
        });
      },
    );
  }
}
