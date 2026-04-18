import { Hono } from "hono";
import { creerMiddlewareAuthObligatoire } from "../../auth/auth.middleware.js";
import { EN_TETE_ID_REQUETE_INTERNE } from "../constantes-correlation-http.js";
import type { VariablesGateway } from "../types/gateway-variables.js";

/**
 * Relais HTTP JWT vers `web-service` pour le chemin `/web-instances` (cycle de vie des conteneurs applicatifs).
 */
export function monterRoutesWebInstancesPasserelle(
  app: Hono<{ Variables: VariablesGateway }>,
  secretJwt: Uint8Array,
  urlBaseServiceWeb: string | undefined,
): void {
  if (!urlBaseServiceWeb) {
    return;
  }
  const base = urlBaseServiceWeb.replace(/\/+$/, "");
  const sousRouteur = new Hono<{ Variables: VariablesGateway }>();
  sousRouteur.use("*", creerMiddlewareAuthObligatoire(secretJwt));
  sousRouteur.all("*", async (c) => {
    const utilisateur = c.get("utilisateur");
    if (utilisateur === undefined) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Session requise pour le service web.",
          },
        },
        401,
      );
    }
    const urlEntrante = new URL(c.req.url, "http://127.0.0.1");
    const cheminComplet =
      "/web-instances" + (c.req.path === "/" ? "" : c.req.path);
    const cible = new URL(
      cheminComplet + urlEntrante.search,
      `${base}/`,
    );
    const enTetesSortie = new Headers();
    enTetesSortie.set("x-kidopanel-utilisateur-id", utilisateur.id);
    enTetesSortie.set("x-kidopanel-role-utilisateur", utilisateur.role);
    enTetesSortie.set(EN_TETE_ID_REQUETE_INTERNE, c.get("requestId"));
    const methode = c.req.method;
    const avecCorps =
      methode !== "GET" && methode !== "HEAD" && methode !== "OPTIONS";
    let corps: ArrayBuffer | undefined;
    if (avecCorps) {
      corps = await c.req.arrayBuffer();
    }
    const typeContenu = c.req.header("content-type");
    if (typeContenu !== undefined && avecCorps && corps !== undefined) {
      enTetesSortie.set("Content-Type", typeContenu);
    }
    const reponseAmont = await fetch(cible.toString(), {
      method: methode,
      headers: enTetesSortie,
      body: corps !== undefined && corps.byteLength > 0 ? corps : undefined,
    });
    const enTetesReponse = new Headers(reponseAmont.headers);
    enTetesReponse.delete("transfer-encoding");
    return new Response(reponseAmont.body, {
      status: reponseAmont.status,
      headers: enTetesReponse,
    });
  });
  app.route("/web-instances", sousRouteur);
}
