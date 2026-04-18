import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import type { VariablesHttpWeb } from "../http/types/variables-http-web.js";
import { corpsAjoutDomaineProxySchema } from "../http/schemas/domaine-proxy-corps.schema.js";
import { creerMiddlewareIdentiteInterneObligatoire } from "../http/middleware/identite-interne.middleware.js";
import type { DepotDomaineProxy } from "../repositories/depot-domaine-proxy.repository.js";
import type { DepotWebInstance } from "../repositories/depot-web-instance.repository.js";
import type { ProxyManagerService } from "../services/proxy-manager.service.js";
import type { ClientMoteurWebHttp } from "../services/client-moteur-web.service.js";
import { ErreurMetierWebInstance } from "../erreurs/erreurs-metier-web-instance.js";

/**
 * Routes `/proxy` : domaines exposés et rechargement du proxy partagé.
 */
export function monterRoutesProxyManager(params: {
  depotDomaine: DepotDomaineProxy;
  depotWeb: DepotWebInstance;
  proxyManager: ProxyManagerService;
  clientMoteur: ClientMoteurWebHttp;
}): Hono<{ Variables: VariablesHttpWeb }> {
  const routes = new Hono<{ Variables: VariablesHttpWeb }>();
  routes.use("*", creerMiddlewareIdentiteInterneObligatoire());

  routes.get("/domaines", async (c) => {
    try {
      const liste = await params.depotDomaine.listerParUtilisateur(
        c.get("utilisateurIdInterne")!,
      );
      return c.json({ domaines: liste });
    } catch (erreur) {
      return repondreErreurProxy(c, erreur);
    }
  });

  routes.post(
    "/domaines",
    zValidator("json", corpsAjoutDomaineProxySchema),
    async (c) => {
      try {
        const corps = c.req.valid("json");
        const uid = c.get("utilisateurIdInterne")!;
        const role = c.get("roleUtilisateurInterne")!;
        if (role === "VIEWER") {
          throw new ErreurMetierWebInstance(
            "ROLE_LECTURE_SEULE_MUTATION_INTERDITE",
            "Ajout de domaine interdit pour le rôle observateur.",
            403,
          );
        }
        const instance = await params.depotWeb.trouverParId(corps.webInstanceId);
        if (!instance || instance.userId !== uid) {
          throw new ErreurMetierWebInstance(
            "INSTANCE_WEB_NON_TROUVEE",
            "Instance web introuvable ou non autorisée.",
            404,
          );
        }
        const idDocker = instance.containerId?.trim();
        if (!idDocker) {
          throw new ErreurMetierWebInstance(
            "MOTEUR_CONTENEURS_ERREUR",
            "Le conteneur applicatif est absent ; impossible de résoudre la cible proxy.",
            409,
          );
        }
        const ip = await params.clientMoteur.obtenirIpv4ReseauKidopanelPourConteneur(
          idDocker,
          c.get("requestId"),
        );
        if (ip === undefined) {
          throw new ErreurMetierWebInstance(
            "MOTEUR_CONTENEURS_ERREUR",
            "Adresse IPv4 interne introuvable pour ce conteneur (liste moteur).",
            502,
          );
        }
        const cree = await params.depotDomaine.creer({
          id: randomUUID(),
          userId: uid,
          webInstanceId: corps.webInstanceId,
          domaine: corps.domaine.trim().toLowerCase(),
          cibleInterne: ip,
          portCible: corps.portCible,
        });
        await params.proxyManager.rechargerConfigurationProxy(undefined, c.get("requestId"));
        return c.json(cree, 201);
      } catch (erreur) {
        return repondreErreurProxy(c, erreur);
      }
    },
  );

  routes.delete("/domaines/:id", async (c) => {
    try {
      const uid = c.get("utilisateurIdInterne")!;
      const role = c.get("roleUtilisateurInterne")!;
      if (role === "VIEWER") {
        throw new ErreurMetierWebInstance(
          "ROLE_LECTURE_SEULE_MUTATION_INTERDITE",
          "Suppression interdite pour le rôle observateur.",
          403,
        );
      }
      const ligne = await params.depotDomaine.trouverParIdPourUtilisateur(
        c.req.param("id"),
        uid,
      );
      if (!ligne) {
        throw new ErreurMetierWebInstance(
          "DOMAIN_PROXY_NON_TROUVE",
          "Domaine introuvable.",
          404,
        );
      }
      await params.depotDomaine.supprimer(ligne.id);
      await params.proxyManager.rechargerConfigurationProxy(undefined, c.get("requestId"));
      return c.body(null, 204);
    } catch (erreur) {
      return repondreErreurProxy(c, erreur);
    }
  });

  routes.post("/reload", async (c) => {
    try {
      await params.proxyManager.rechargerConfigurationProxy(undefined, c.get("requestId"));
      return c.body(null, 204);
    } catch (erreur) {
      return repondreErreurProxy(c, erreur);
    }
  });

  return routes;
}

function repondreErreurProxy(c: Pick<Context, "json">, erreur: unknown) {
  if (erreur instanceof ErreurMetierWebInstance) {
    return c.json(
      {
        error: {
          code: erreur.codeMetier,
          message: erreur.message,
          details: erreur.details,
        },
      },
      erreur.statutHttp as never,
    );
  }
  throw erreur;
}
