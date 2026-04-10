import { serve } from "@hono/node-server";
import { createGatewayApp } from "./http/create-gateway-app.js";

const port = Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000);

if (!Number.isFinite(port) || port < 1 || port > 65_535) {
  console.error(
    "[gateway] Port invalide (GATEWAY_PORT ou PORT).",
  );
  process.exitCode = 1;
} else {
  let app;
  try {
    app = createGatewayApp();
  } catch (erreur) {
    console.error(
      "[gateway] Impossible de démarrer (configuration ou secrets) :",
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
        console.log(
          `[gateway] API à l’écoute sur le port ${String(info.port)} (relai vers container-engine).`,
        );
      },
    );
  }
}
