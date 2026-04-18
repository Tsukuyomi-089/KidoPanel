import type { ChampGabaritDockerRapide } from "./gabarits-docker-rapide.js";

/** Champs métier affichés pour Minecraft Java (variables acceptées par l'image itzg). */
export const CHAMPS_FORMULAIRE_MINECRAFT_JAVA: readonly ChampGabaritDockerRapide[] =
  [
    {
      cle: "SERVER_NAME",
      label: "Nom du serveur",
      aide: "Affiché dans la liste des serveurs Minecraft.",
      type: "text",
      defaut: "Mon serveur Minecraft",
      requis: true,
    },
    {
      cle: "DIFFICULTY",
      label: "Difficulté",
      type: "select",
      defaut: "normal",
      options: [
        { valeur: "peaceful", libelle: "Pacifique" },
        { valeur: "easy", libelle: "Facile" },
        { valeur: "normal", libelle: "Normal" },
        { valeur: "hard", libelle: "Difficile" },
      ],
      requis: true,
    },
    {
      cle: "MODE",
      label: "Mode de jeu",
      type: "select",
      defaut: "survival",
      options: [
        { valeur: "survival", libelle: "Survie" },
        { valeur: "creative", libelle: "Créatif" },
        { valeur: "adventure", libelle: "Aventure" },
        { valeur: "spectator", libelle: "Spectateur" },
      ],
      requis: true,
    },
    {
      cle: "MAX_PLAYERS",
      label: "Nombre de joueurs maximum",
      type: "number",
      defaut: "20",
      min: 1,
      max: 200,
      requis: false,
    },
    {
      cle: "OPS",
      label: "Opérateurs (pseudos séparés par des virgules)",
      aide: "Comptes Minecraft autorisés à administrer le serveur.",
      type: "text",
      requis: false,
    },
    {
      cle: "VERSION",
      label: "Version de Minecraft",
      aide: "Laissez la valeur par défaut pour la dernière version stable.",
      type: "text",
      defaut: "LATEST",
      requis: false,
    },
  ];

export const CHAMPS_FORMULAIRE_MINECRAFT_BEDROCK: readonly ChampGabaritDockerRapide[] =
  [
    {
      cle: "SERVER_NAME",
      label: "Nom du serveur",
      type: "text",
      defaut: "Mon monde Bedrock",
      requis: true,
    },
    {
      cle: "GAMEMODE",
      label: "Mode de jeu",
      type: "select",
      defaut: "survival",
      options: [
        { valeur: "survival", libelle: "Survie" },
        { valeur: "creative", libelle: "Créatif" },
        { valeur: "adventure", libelle: "Aventure" },
      ],
      requis: true,
    },
    {
      cle: "DIFFICULTY",
      label: "Difficulté",
      type: "select",
      defaut: "normal",
      options: [
        { valeur: "peaceful", libelle: "Pacifique" },
        { valeur: "easy", libelle: "Facile" },
        { valeur: "normal", libelle: "Normal" },
        { valeur: "hard", libelle: "Difficile" },
      ],
      requis: true,
    },
  ];

export const CHAMPS_FORMULAIRE_VALHEIM: readonly ChampGabaritDockerRapide[] = [
  {
    cle: "SERVER_NAME",
    label: "Nom du serveur",
    type: "text",
    requis: true,
  },
  {
    cle: "SERVER_PASS",
    label: "Mot de passe serveur",
    type: "password",
    requis: true,
  },
  {
    cle: "WORLD_NAME",
    label: "Nom du monde",
    type: "text",
    requis: false,
  },
  {
    cle: "PUBLIC",
    label: "Liste publique Steam",
    aide: "1 pour rendre le serveur visible dans la liste, 0 pour un serveur privé.",
    type: "select",
    defaut: "1",
    options: [
      { valeur: "1", libelle: "Oui" },
      { valeur: "0", libelle: "Non" },
    ],
    requis: false,
  },
];

export const CHAMPS_FORMULAIRE_TERRARIA: readonly ChampGabaritDockerRapide[] = [
  {
    cle: "WORLD_NAME",
    label: "Nom du monde",
    type: "text",
    requis: false,
  },
  {
    cle: "PASSWORD",
    label: "Mot de passe du serveur",
    type: "password",
    requis: false,
  },
  {
    cle: "MAX_PLAYERS",
    label: "Joueurs maximum",
    type: "number",
    defaut: "8",
    min: 1,
    max: 255,
    requis: false,
  },
];

export const CHAMPS_FORMULAIRE_CS2: readonly ChampGabaritDockerRapide[] = [
  {
    cle: "STEAMUSER",
    label: "Identifiant Steam",
    type: "text",
    requis: true,
  },
  {
    cle: "STEAMPASS",
    label: "Mot de passe Steam",
    type: "password",
    requis: true,
  },
  {
    cle: "TICKRATE",
    label: "Tickrate du serveur",
    type: "number",
    defaut: "64",
    min: 10,
    max: 128,
    requis: false,
  },
  {
    cle: "CS2_ARGS",
    label: "Arguments supplémentaires",
    aide: "Options de ligne de commande du serveur dédié.",
    type: "text",
    requis: false,
  },
];

export const CHAMPS_FORMULAIRE_SATISFACTORY: readonly ChampGabaritDockerRapide[] =
  [
    {
      cle: "MAXPLAYERS",
      label: "Joueurs maximum",
      type: "number",
      defaut: "4",
      min: 1,
      max: 16,
      requis: false,
    },
  ];

export const CHAMPS_FORMULAIRE_ARK: readonly ChampGabaritDockerRapide[] = [
  {
    cle: "SESSION_NAME",
    label: "Nom de la session",
    type: "text",
    requis: true,
  },
  {
    cle: "SERVER_MAP",
    label: "Carte / carte de démarrage",
    type: "text",
    requis: false,
  },
  {
    cle: "SERVER_PASSWORD",
    label: "Mot de passe du serveur",
    type: "password",
    requis: false,
  },
];
