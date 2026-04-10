import { useState } from "react";
import { useFluxJournauxConteneur } from "../hooks/useFluxJournauxConteneur.js";

const URL_PASSERELLE_DEFAUT =
  import.meta.env.VITE_GATEWAY_BASE_URL ?? "http://127.0.0.1:3000";

/**
 * Panneau optionnel pour afficher le flux SSE des journaux d’un conteneur (Bearer JWT passerelle).
 */
export function PanneauJournauxConteneur() {
  const [urlPasserelle, setUrlPasserelle] = useState(URL_PASSERELLE_DEFAUT);
  const [idConteneur, setIdConteneur] = useState("");
  const [jeton, setJeton] = useState("");
  const [fluxActif, setFluxActif] = useState(false);

  const { lignes, etatConnexion, dernierMessageErreur, effacer } =
    useFluxJournauxConteneur({
      urlBasePasserelle: urlPasserelle,
      idConteneur,
      jetonBearer: jeton,
      actif: fluxActif,
      tailEntrees: 200,
      horodatageDocker: true,
    });

  return (
    <section
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #333",
        borderRadius: 8,
        maxWidth: 720,
      }}
    >
      <h2>Journaux en direct (SSE)</h2>
      <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
        Connexion à la passerelle avec un jeton JWT ; aucun polling sur l’endpoint
        JSON historique.
      </p>
      <div
        style={{
          display: "grid",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>URL passerelle</span>
          <input
            value={urlPasserelle}
            onChange={(e) => setUrlPasserelle(e.target.value)}
            type="url"
            autoComplete="off"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Identifiant conteneur</span>
          <input
            value={idConteneur}
            onChange={(e) => setIdConteneur(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Jeton Bearer</span>
          <input
            value={jeton}
            onChange={(e) => setJeton(e.target.value)}
            type="password"
            autoComplete="off"
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setFluxActif((v) => !v)}
        >
          {fluxActif ? "Arrêter le flux" : "Démarrer le flux"}
        </button>
        <button type="button" onClick={effacer}>
          Effacer l’affichage
        </button>
      </div>
      <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
        État : <strong>{etatConnexion}</strong>
        {dernierMessageErreur ? (
          <>
            {" "}
            — <span style={{ color: "#c00" }}>{dernierMessageErreur}</span>
          </>
        ) : null}
      </p>
      <pre
        style={{
          marginTop: "0.5rem",
          maxHeight: 280,
          overflow: "auto",
          background: "#111",
          color: "#e8e8e8",
          padding: "0.75rem",
          fontSize: 12,
          borderRadius: 4,
        }}
      >
        {lignes.join("\n")}
      </pre>
    </section>
  );
}
