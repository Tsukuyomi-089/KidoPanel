import { useCallback, useEffect, useState } from "react";
import type { InstanceTemplate } from "@kidopanel/container-catalog";
import { chargerTemplatesDepuisPasserelle } from "../../passerelle/serviceTemplatesPasserelle.js";
import { EtapeListeTemplatesInstance } from "./EtapeListeTemplatesInstance.js";
import { EtapeConfigurationGabaritInstance } from "./EtapeConfigurationGabaritInstance.js";

type EtapeAssistant = "liste" | "configuration";

type Props = {
  jetonSession: string;
  surCreerDepuisTemplate: (
    templateId: string,
    configuration: Record<string, unknown>,
  ) => Promise<void>;
  surPasserModeAvanceAvecCorps: (corps: Record<string, unknown>) => void;
};

/**
 * Assistant en trois temps : liste des gabarits, fusion JSON optionnelle, accès au formulaire avancé existant.
 */
export function AssistantCreationInstanceKidoPanel({
  jetonSession,
  surCreerDepuisTemplate,
  surPasserModeAvanceAvecCorps,
}: Props) {
  const [etape, setEtape] = useState<EtapeAssistant>("liste");
  const [gabarits, setGabarits] = useState<InstanceTemplate[]>([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [erreurListe, setErreurListe] = useState<string | null>(null);
  const [gabaritCourant, setGabaritCourant] = useState<InstanceTemplate | null>(null);
  const [texteConfigurationJson, setTexteConfigurationJson] = useState("{}\n");
  const [creationLocale, setCreationLocale] = useState(false);
  const [erreurEtapeConfiguration, setErreurEtapeConfiguration] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (jetonSession.trim() === "") {
      setChargementListe(false);
      setErreurListe("Authentifiez-vous pour charger les gabarits.");
      return;
    }
    let annule = false;
    void (async () => {
      setChargementListe(true);
      setErreurListe(null);
      try {
        const liste = await chargerTemplatesDepuisPasserelle();
        if (!annule) {
          setGabarits(liste);
        }
      } catch (e) {
        if (!annule) {
          setErreurListe(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!annule) {
          setChargementListe(false);
        }
      }
    })();
    return () => {
      annule = true;
    };
  }, [jetonSession]);

  const surChoisirGabarit = useCallback((g: InstanceTemplate) => {
    setGabaritCourant(g);
    setTexteConfigurationJson("{}\n");
    setErreurEtapeConfiguration(null);
    setEtape("configuration");
  }, []);

  const corpsFusionnePourModeAvance = useCallback(() => {
    const gabarit = gabaritCourant;
    if (gabarit === null) {
      return {};
    }
    let surcharge: Record<string, unknown> = {};
    try {
      const parse = JSON.parse(texteConfigurationJson) as unknown;
      if (
        parse !== null &&
        typeof parse === "object" &&
        !Array.isArray(parse)
      ) {
        surcharge = parse as Record<string, unknown>;
      }
    } catch {
      surcharge = {};
    }
    const base = gabarit.defaultConfig as Record<string, unknown>;
    return {
      ...base,
      ...surcharge,
      imageCatalogId: gabarit.imageCatalogId,
    };
  }, [gabaritCourant, texteConfigurationJson]);

  const ouvrirFormulaireAvance = useCallback(() => {
    try {
      JSON.parse(texteConfigurationJson);
    } catch {
      setErreurEtapeConfiguration(
        "Corrigez le JSON de surcouche ou utilisez un objet vide `{}` avant le mode avancé.",
      );
      return;
    }
    setErreurEtapeConfiguration(null);
    surPasserModeAvanceAvecCorps(corpsFusionnePourModeAvance());
  }, [
    corpsFusionnePourModeAvance,
    surPasserModeAvanceAvecCorps,
    texteConfigurationJson,
  ]);

  const surCreer = useCallback(async () => {
    const gabarit = gabaritCourant;
    if (gabarit === null) {
      return;
    }
    let configuration: Record<string, unknown> = {};
    try {
      const parse = JSON.parse(texteConfigurationJson) as unknown;
      if (
        parse !== null &&
        typeof parse === "object" &&
        !Array.isArray(parse)
      ) {
        configuration = parse as Record<string, unknown>;
      }
    } catch {
      setErreurEtapeConfiguration(
        "Le JSON de surcouche est invalide : corrigez-le ou passez en mode avancé.",
      );
      return;
    }
    setErreurEtapeConfiguration(null);
    setCreationLocale(true);
    try {
      await surCreerDepuisTemplate(gabarit.id, configuration);
    } finally {
      setCreationLocale(false);
    }
  }, [gabaritCourant, surCreerDepuisTemplate, texteConfigurationJson]);

  return (
    <div className="kp-assistant-instance">
      {etape === "liste" ? (
        <EtapeListeTemplatesInstance
          gabarits={gabarits}
          chargement={chargementListe}
          erreur={erreurListe}
          surChoisir={surChoisirGabarit}
        />
      ) : gabaritCourant !== null ? (
        <EtapeConfigurationGabaritInstance
          gabarit={gabaritCourant}
          texteConfigurationJson={texteConfigurationJson}
          surTexteConfigurationJson={(t) => {
            setTexteConfigurationJson(t);
            setErreurEtapeConfiguration(null);
          }}
          surRetourListe={() => {
            setEtape("liste");
            setGabaritCourant(null);
          }}
          surModeAvance={ouvrirFormulaireAvance}
          surCreer={surCreer}
          creationEnCours={creationLocale}
          messageErreur={erreurEtapeConfiguration}
        />
      ) : null}
    </div>
  );
}
