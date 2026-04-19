import { Hono } from "hono";
import type { ContainerOwnershipRepository } from "../../auth/container-ownership-repository.prisma.js";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import { prisma } from "@kidopanel/database";
import { collecterIndicateursTableauPanel } from "../services/panel-indicateurs.service.js";
import type { VariablesGateway } from "../types/gateway-variables.js";
import { resoudreHotePublicConnexionJeuxDepuisRequete } from "../util/resoudre-hote-public-connexion-jeux.js";

/**
 * Routes tableau de bord : agrégats santé et volumétrie conteneurs pour l’utilisateur authentifié.
 */
export function monterRoutesPanelIndicateurs(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
  depotPropriete: ContainerOwnershipRepository,
): void {
  const panel = new Hono<{ Variables: VariablesGateway }>();
  panel.use("*", creerMiddlewareAuthObligatoire(secretJwt));

  panel.get("/indicateurs", async (c) => {
    const utilisateur = c.get("utilisateur");
    if (utilisateur === undefined) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Session requise pour les indicateurs du tableau de bord.",
          },
        },
        401,
      );
    }
    const donnees = await collecterIndicateursTableauPanel({
      prisma,
      depotPropriete,
      utilisateur,
      identifiantRequete: c.get("requestId"),
    });
    return c.json(donnees);
  });

  /**
   * Hôte public pour « hôte : port » côté joueurs : variable d’environnement, en-têtes **`X-Forwarded-Host`** (proxy Vite
   * ou reverse proxy) ou **`Host`** non loopback (voir **`resoudreHotePublicConnexionJeuxDepuisRequete`**).
   */
  panel.get("/adresse-connexion-jeux", async (c) => {
    const utilisateur = c.get("utilisateur");
    if (utilisateur === undefined) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Session requise pour l’adresse de connexion jeu.",
          },
        },
        401,
      );
    }
    const hotePublicPourJeux = resoudreHotePublicConnexionJeuxDepuisRequete(c);
    return c.json({ hotePublicPourJeux });
  });

  app.route("/panel", panel);
}
