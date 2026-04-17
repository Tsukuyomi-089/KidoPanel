import { useCallback, useEffect, useRef, useState } from "react";
import { chargerLignesHistoriqueJournauxConteneur } from "./flux-journaux-conteneur.charger-historique.js";
import { extraireEvenementsSseDepuisTampon } from "./flux-journaux-conteneur.parser-sse.js";
import { formaterErreurPourAffichagePanel } from "../lab/passerelleErreursAffichageLab.js";

export type OptionsFluxJournauxConteneur = {
  urlBasePasserelle: string;
  idConteneur: string;
  jetonBearer: string;
  actif: boolean;
  tailEntrees?: number;
  horodatageDocker?: boolean;
  lignesMaxAffichage?: number;
  /**
   * Avant le premier SSE de la session : même `GET /containers/:id/logs` que Portainer
   * pour afficher les dernières lignes puis le flux (reconnexion réseau ne recharge pas l’historique).
   */
  chargementHistoriqueInitial?: boolean;
};

type EtatConnexion = "inactif" | "connecte" | "reconnexion" | "erreur";

function delaiReconnexionMs(tentative: number): number {
  const base = 1000 * 2 ** Math.min(tentative, 5);
  return Math.min(base, 30_000);
}

/**
 * Consomme le flux SSE `GET /containers/:id/logs/stream` avec reconnexion exponentielle plafonnée.
 */
export function useFluxJournauxConteneur(
  options: OptionsFluxJournauxConteneur,
): {
  lignes: string[];
  etatConnexion: EtatConnexion;
  dernierMessageErreur: string | null;
  effacer: () => void;
} {
  const {
    urlBasePasserelle,
    idConteneur,
    jetonBearer,
    actif,
    tailEntrees,
    horodatageDocker,
    lignesMaxAffichage = 5000,
    chargementHistoriqueInitial,
  } = options;

  const [lignes, setLignes] = useState<string[]>([]);
  const [etatConnexion, setEtatConnexion] = useState<EtatConnexion>("inactif");
  const [dernierMessageErreur, setDernierMessageErreur] = useState<string | null>(
    null,
  );
  const refTentatives = useRef(0);
  const refHistoriqueInitialCharge = useRef(false);

  const effacer = useCallback(() => {
    setLignes([]);
  }, []);

  useEffect(() => {
    if (!actif || !jetonBearer.trim() || !idConteneur.trim()) {
      setEtatConnexion("inactif");
      refHistoriqueInitialCharge.current = false;
      return;
    }

    let executionAnnulee = false;
    let idTemporisation: ReturnType<typeof setTimeout> | undefined;
    let controleurAnnulation: AbortController | undefined;

    const programmerReconnexion = (): void => {
      if (executionAnnulee) {
        return;
      }
      refTentatives.current += 1;
      setEtatConnexion("reconnexion");
      const attente = delaiReconnexionMs(refTentatives.current);
      idTemporisation = setTimeout(() => {
        void etablirFlux();
      }, attente);
    };

    const etablirFlux = async (): Promise<void> => {
      if (executionAnnulee) {
        return;
      }
      controleurAnnulation?.abort();
      controleurAnnulation = new AbortController();

      const base = urlBasePasserelle.replace(/\/$/, "");
      const doitInjecterHistorique =
        (chargementHistoriqueInitial ?? true) &&
        !refHistoriqueInitialCharge.current;
      if (doitInjecterHistorique) {
        refHistoriqueInitialCharge.current = true;
        try {
          const morceaux = await chargerLignesHistoriqueJournauxConteneur({
            urlBasePasserelle,
            idConteneur,
            jetonBearer,
            tailEntrees,
            horodatageDocker,
            signal: controleurAnnulation.signal,
          });
          setLignes(morceaux);
        } catch {
          setLignes([]);
        }
      }

      const url = new URL(
        `${base}/containers/${encodeURIComponent(idConteneur)}/logs/stream`,
      );
      if (tailEntrees !== undefined) {
        url.searchParams.set("tail", String(tailEntrees));
      }
      if (horodatageDocker) {
        url.searchParams.set("timestamps", "true");
      }

      try {
        const urlFlux = url.toString();
        const reponse = await fetch(urlFlux, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${jetonBearer}`,
            Accept: "text/event-stream",
          },
          signal: controleurAnnulation.signal,
        });

        if (reponse.status === 401) {
          setDernierMessageErreur("Authentification requise ou jeton invalide.");
          setEtatConnexion("erreur");
          return;
        }

        if (reponse.status === 403) {
          setDernierMessageErreur("Accès au conteneur refusé.");
          setEtatConnexion("erreur");
          return;
        }

        if (!reponse.ok || !reponse.body) {
          let detailHttp = `HTTP ${reponse.status}`;
          if (reponse.statusText.trim() !== "") {
            detailHttp += ` ${reponse.statusText}`;
          }
          try {
            const corps = await reponse.clone().text();
            if (corps.trim() !== "") {
              detailHttp += `\n\nCorps de la réponse :\n${corps.slice(0, 4000)}`;
            }
          } catch {
            /* corps illisible */
          }
          setDernierMessageErreur(
            [
              "Flux journaux SSE : réponse refusée ou sans corps lisible.",
              "",
              `URL : ${urlFlux}`,
              "",
              detailHttp,
            ].join("\n"),
          );
          programmerReconnexion();
          return;
        }

        refTentatives.current = 0;
        setDernierMessageErreur(null);
        setEtatConnexion("connecte");

        const lecteur = reponse.body.getReader();
        const decodeur = new TextDecoder();
        let tamponSse = "";

        while (!executionAnnulee) {
          const { done, value } = await lecteur.read();
          if (done) {
            break;
          }
          tamponSse += decodeur.decode(value, { stream: true });
          const { tamponRestant, evenements } =
            extraireEvenementsSseDepuisTampon(tamponSse);
          tamponSse = tamponRestant;

          for (const ev of evenements) {
            if (ev.typeEvenement === "ping") {
              continue;
            }
            if (ev.typeEvenement === "error") {
              try {
                const parse = JSON.parse(ev.donnees) as { message?: string };
                setDernierMessageErreur(parse.message ?? ev.donnees);
              } catch {
                setDernierMessageErreur(ev.donnees);
              }
              continue;
            }
            try {
              const parse = JSON.parse(ev.donnees) as { line?: string };
              if (typeof parse.line === "string") {
                setLignes((precedent) => {
                  const suite = [...precedent, parse.line as string];
                  if (suite.length > lignesMaxAffichage) {
                    return suite.slice(-lignesMaxAffichage);
                  }
                  return suite;
                });
              }
            } catch {
              /* événement hors format JSON : ignoré */
            }
          }
        }

        if (!executionAnnulee) {
          programmerReconnexion();
        }
      } catch (err) {
        if (executionAnnulee) {
          return;
        }
        if (
          err instanceof Error &&
          (err.name === "AbortError" ||
            (typeof DOMException !== "undefined" &&
              err instanceof DOMException &&
              err.name === "AbortError"))
        ) {
          return;
        }
        setDernierMessageErreur(
          formaterErreurPourAffichagePanel(
            err,
            url.toString(),
            "flux SSE journaux conteneur",
          ),
        );
        programmerReconnexion();
      }
    };

    void etablirFlux();

    return () => {
      executionAnnulee = true;
      controleurAnnulation?.abort();
      if (idTemporisation !== undefined) {
        clearTimeout(idTemporisation);
      }
      refTentatives.current = 0;
      refHistoriqueInitialCharge.current = false;
    };
  }, [
    actif,
    jetonBearer,
    idConteneur,
    urlBasePasserelle,
    tailEntrees,
    horodatageDocker,
    lignesMaxAffichage,
    chargementHistoriqueInitial,
  ]);

  return { lignes, etatConnexion, dernierMessageErreur, effacer };
}
