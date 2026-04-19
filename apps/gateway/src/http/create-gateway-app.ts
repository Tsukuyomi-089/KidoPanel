import { Hono } from "hono";
import { prisma } from "@kidopanel/database";
import { ServiceAuth } from "../auth/auth.service.js";
import { ContainerOwnershipRepository } from "../auth/container-ownership-repository.prisma.js";
import { ReseauInterneUtilisateurRepository } from "../auth/reseau-interne-utilisateur-repository.prisma.js";
import { UserRepository } from "../auth/user-repository.prisma.js";
import {
  encoderSecretJwt,
  loadGatewayEnv,
} from "../config/gateway-env.js";
import { monterRoutesServeursJeuSiConfigure } from "./routes/serveurs-jeu-proxy.routes.js";
import { monterRoutesWebInstancesPasserelle } from "./routes/web-instances-proxy.routes.js";
import { monterRoutesProxyManagerPasserelle } from "./routes/proxy-manager-passerelle.routes.js";
import { monterRoutesReseauxInternesPasserelle } from "./routes/reseaux-internes-passerelle.routes.js";
import { monterRoutesAuth } from "./routes/auth.routes.js";
import { monterRoutesProxyConteneurs } from "./routes/containers-proxy.routes.js";
import { monterRouteCatalogueImagesPasserelle } from "./routes/images-catalogue-passerelle.routes.js";
import { monterRouteTemplatesCataloguePasserelle } from "./routes/templates-catalogue-passerelle.routes.js";
import { monterRoutesPanelIndicateurs } from "./routes/panel-indicateurs.routes.js";
import { monterRoutesDiagnosticPareFeuPasserelle } from "./routes/diagnostic-pare-feu-passerelle.routes.js";
import { monterRoutesRacineEtSante } from "./routes/root-and-health.routes.js";
import { creerMiddlewareRateLimit } from "./middleware/rate-limit.middleware.js";
import { creerMiddlewareCorsPanel } from "./middleware/cors-panel.middleware.js";
import {
  middlewareCorrelationRequete,
  routeMetriquesPasserelle,
} from "./middleware/correlation-requete.middleware.js";
import type { VariablesGateway } from "./types/gateway-variables.js";
import { journaliserErreurPasserelle } from "../observabilite/journal-json.js";

/** Assemble l’application Hono : corrélation, limitation, auth, proxy moteur cloisonné. */
export function createGatewayApp(): Hono<{ Variables: VariablesGateway }> {
  const env = loadGatewayEnv();
  const secretJwt = encoderSecretJwt(env);
  const userRepository = new UserRepository(prisma);
  const depotPropriete = new ContainerOwnershipRepository(prisma);
  const depotReseauxInternes = new ReseauInterneUtilisateurRepository(prisma);
  const serviceAuth = new ServiceAuth({
    userRepository,
    secretJwt,
    expirationSecondes: env.jwtExpiresSeconds,
    coutBcrypt: env.bcryptCost,
  });

  const app = new Hono<{ Variables: VariablesGateway }>();

  app.use("*", creerMiddlewareCorsPanel());
  app.use("*", middlewareCorrelationRequete);
  app.use(
    "*",
    creerMiddlewareRateLimit(env.rateLimitMax, env.rateLimitWindowMs),
  );

  monterRoutesRacineEtSante(app);
  app.get("/metrics", routeMetriquesPasserelle);
  monterRoutesAuth(app, serviceAuth);
  monterRoutesPanelIndicateurs(app, secretJwt, depotPropriete);
  monterRoutesDiagnosticPareFeuPasserelle(app, secretJwt);
  monterRoutesProxyConteneurs(app, secretJwt, depotPropriete);
  monterRoutesReseauxInternesPasserelle(app, secretJwt, depotReseauxInternes);
  monterRouteCatalogueImagesPasserelle(app, secretJwt);
  monterRouteTemplatesCataloguePasserelle(app, secretJwt);
  monterRoutesServeursJeuSiConfigure(
    app,
    secretJwt,
    env.serverServiceBaseUrl,
  );
  monterRoutesWebInstancesPasserelle(app, secretJwt, env.webServiceBaseUrl);
  monterRoutesProxyManagerPasserelle(app, secretJwt, env.webServiceBaseUrl);

  app.notFound((c) =>
    c.json(
      {
        error: {
          code: "ROUTE_NOT_FOUND",
          message: "Route HTTP introuvable sur la passerelle.",
        },
      },
      404,
    ),
  );

  app.onError((erreur, c) => {
    journaliserErreurPasserelle(
      "erreur_http_non_geree",
      erreur,
      c.get("requestId"),
    );
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Erreur interne de la passerelle.",
        },
      },
      500,
    );
  });

  return app;
}
