import { useCallback, useEffect, useState } from "react";
import { SectionAuthLab } from "./SectionAuthLab.js";
import {
  SectionCreationConteneurLab,
  SectionListeConteneursLab,
} from "./SectionConteneursEtCreationLab.js";
import { SectionJournauxSseLab } from "./SectionJournauxSseLab.js";
import {
  appelerPasserelle,
  corpsErreurDepuisReponse,
  enregistrerJetonStockage,
  formaterErreurAffichage,
  lireJetonStockage,
  urlBasePasserelle,
} from "./passerelleClient.js";
import { styleBlocLab, stylePreLab } from "./stylesCommunsLab.js";
import type { ResumeConteneurLab } from "./typesConteneurLab.js";

/**
 * Interface minimale pour enregistrer un compte, se connecter, piloter les conteneurs
 * et afficher le flux SSE des journaux via la passerelle.
 */
export function InterfaceTestPasserelle() {
  const [jeton, setJeton] = useState(lireJetonStockage);
  const [emailInscription, setEmailInscription] = useState("");
  const [motDePasseInscription, setMotDePasseInscription] = useState("");
  const [emailConnexion, setEmailConnexion] = useState("");
  const [motDePasseConnexion, setMotDePasseConnexion] = useState("");
  const [conteneurs, setConteneurs] = useState<ResumeConteneurLab[]>([]);
  const [idSelectionne, setIdSelectionne] = useState("");
  const [imageCreation, setImageCreation] = useState("nginx:alpine");
  const [nomCreation, setNomCreation] = useState("");
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [chargementListe, setChargementListe] = useState(false);
  const [fluxJournauxActif, setFluxJournauxActif] = useState(false);

  useEffect(() => {
    enregistrerJetonStockage(jeton);
  }, [jeton]);

  const afficherErreurSiBesoin = useCallback(async (reponse: Response) => {
    if (reponse.ok) {
      setMessageErreur(null);
      return true;
    }
    const corps = await corpsErreurDepuisReponse(reponse);
    setMessageErreur(formaterErreurAffichage(corps));
    return false;
  }, []);

  const rafraichirListe = useCallback(async () => {
    setChargementListe(true);
    setMessageErreur(null);
    try {
      const reponse = await appelerPasserelle("/containers", { method: "GET" });
      if (!(await afficherErreurSiBesoin(reponse))) {
        return;
      }
      const donnees = (await reponse.json()) as {
        containers?: ResumeConteneurLab[];
      };
      setConteneurs(Array.isArray(donnees.containers) ? donnees.containers : []);
    } catch (e) {
      setMessageErreur(
        e instanceof Error ? e.message : "Échec réseau lors du listage.",
      );
    } finally {
      setChargementListe(false);
    }
  }, [afficherErreurSiBesoin]);

  const surInscription = async () => {
    setMessageErreur(null);
    try {
      const reponse = await appelerPasserelle("/auth/register", {
        method: "POST",
        jetonBearer: "",
        body: JSON.stringify({
          email: emailInscription,
          password: motDePasseInscription,
        }),
      });
      if (!(await afficherErreurSiBesoin(reponse))) {
        return;
      }
      const donnees = (await reponse.json()) as { token?: string };
      if (typeof donnees.token === "string") {
        setJeton(donnees.token);
      }
    } catch (e) {
      setMessageErreur(
        e instanceof Error ? e.message : "Échec réseau à l’inscription.",
      );
    }
  };

  const surConnexion = async () => {
    setMessageErreur(null);
    try {
      const reponse = await appelerPasserelle("/auth/login", {
        method: "POST",
        jetonBearer: "",
        body: JSON.stringify({
          email: emailConnexion,
          password: motDePasseConnexion,
        }),
      });
      if (!(await afficherErreurSiBesoin(reponse))) {
        return;
      }
      const donnees = (await reponse.json()) as { token?: string };
      if (typeof donnees.token === "string") {
        setJeton(donnees.token);
      }
    } catch (e) {
      setMessageErreur(
        e instanceof Error ? e.message : "Échec réseau à la connexion.",
      );
    }
  };

  const surCreer = async () => {
    setMessageErreur(null);
    const corps: { image: string; name?: string } = {
      image: imageCreation.trim(),
    };
    const nom = nomCreation.trim();
    if (nom !== "") {
      corps.name = nom;
    }
    try {
      const reponse = await appelerPasserelle("/containers", {
        method: "POST",
        body: JSON.stringify(corps),
      });
      if (!(await afficherErreurSiBesoin(reponse))) {
        return;
      }
      await rafraichirListe();
    } catch (e) {
      setMessageErreur(
        e instanceof Error ? e.message : "Échec réseau à la création.",
      );
    }
  };

  const actionConteneur = async (
    id: string,
    methode: "POST" | "DELETE",
    cheminSuffixe: string,
  ) => {
    setMessageErreur(null);
    try {
      const reponse = await appelerPasserelle(
        `/containers/${encodeURIComponent(id)}${cheminSuffixe}`,
        { method: methode },
      );
      if (!(await afficherErreurSiBesoin(reponse))) {
        return;
      }
      await rafraichirListe();
    } catch (e) {
      setMessageErreur(
        e instanceof Error ? e.message : "Échec réseau sur l’action conteneur.",
      );
    }
  };

  return (
    <main style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.25rem" }}>KidoPanel — test passerelle</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
        Passerelle : <code>{urlBasePasserelle()}</code> (variable{" "}
        <code>VITE_GATEWAY_BASE_URL</code>)
      </p>

      {messageErreur ? (
        <div
          role="alert"
          style={{
            ...styleBlocLab,
            borderColor: "#a33",
            background: "#2a1515",
          }}
        >
          <strong>Erreur</strong>
          <pre style={stylePreLab}>{messageErreur}</pre>
        </div>
      ) : null}

      <SectionAuthLab
        emailInscription={emailInscription}
        setEmailInscription={setEmailInscription}
        motDePasseInscription={motDePasseInscription}
        setMotDePasseInscription={setMotDePasseInscription}
        emailConnexion={emailConnexion}
        setEmailConnexion={setEmailConnexion}
        motDePasseConnexion={motDePasseConnexion}
        setMotDePasseConnexion={setMotDePasseConnexion}
        jeton={jeton}
        setJeton={setJeton}
        surInscription={surInscription}
        surConnexion={surConnexion}
      />

      <SectionListeConteneursLab
        conteneurs={conteneurs}
        idSelectionne={idSelectionne}
        setIdSelectionne={setIdSelectionne}
        rafraichirListe={rafraichirListe}
        chargementListe={chargementListe}
        actionConteneur={actionConteneur}
      />

      <SectionCreationConteneurLab
        imageCreation={imageCreation}
        setImageCreation={setImageCreation}
        nomCreation={nomCreation}
        setNomCreation={setNomCreation}
        surCreer={surCreer}
      />

      <SectionJournauxSseLab
        idSelectionne={idSelectionne}
        jeton={jeton}
        fluxJournauxActif={fluxJournauxActif}
        setFluxJournauxActif={setFluxJournauxActif}
      />
    </main>
  );
}
