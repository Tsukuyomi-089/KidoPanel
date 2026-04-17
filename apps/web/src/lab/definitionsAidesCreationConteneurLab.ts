/**
 * Textes d’aide du formulaire de création de conteneur (laboratoire).
 * Chaque chaîne décrit l’effet du champ pour un opérateur sans supposer la maîtrise de l’API Docker.
 */

export const AIDE_CREATION_CONTENEUR_ENTETE = `Création = enregistrement d’une configuration sur le moteur Docker ; le conteneur n’est « en cours » qu’après un démarrage explicite (bouton Démarrer dans le lab). Un processus principal qui se termine tout de suite laisse le conteneur arrêté avec code 0 : ce n’est pas un plantage du panel. Exemple fréquent : image debian avec commande bash sans TTY ni stdin ouverte — le shell se ferme aussitôt (Exited 0). Pour un shell interactif, cochez « Allouer un TTY » et « Ouvrir stdin », ou mettez dans Cmd une ligne du type sleep infinity pour tester. Pour un service réel, utilisez plutôt une image dont la commande par défaut reste active (nginx, postgres, etc.).`;

export const AIDE_IMAGE_REFERENCE =
  "Nom d’image à utiliser, tel que Docker le résout (dépôt + tag, ex. nginx:alpine). Le moteur tire l’image depuis un registre si elle est absente localement.";

export const AIDE_NOM_CONTENEUR =
  "Nom lisible du conteneur côté Docker (docker ps, scripts). Optionnel : sans nom, Docker attribue un nom aléatoire. Caractères autorisés limités par le moteur.";

export const AIDE_CMD =
  "Arguments passés au point d’entrée de l’image : une ligne = un argument (remplace la commande par défaut de l’image). Laisser vide pour garder la commande déjà définie dans l’image.";

export const AIDE_ENTRYPOINT =
  "Binaire ou script lancé en premier dans le conteneur ; une ligne = un fragment de la liste d’entrée. Laisser vide pour conserver l’entrypoint de l’image. À combiner avec Cmd pour les arguments.";

export const AIDE_REPERTOIRE_TRAVAIL =
  "Répertoire courant du processus principal (chemins relatifs des scripts y sont résolus). Laisser vide pour la valeur fournie par l’image.";

export const AIDE_UTILISATEUR_PROCESSUS =
  "Identité sous laquelle tourne le processus : nom d’utilisateur, uid, ou forme uid:gid. Vide = utilisateur défini par l’image (souvent root).";

export const AIDE_HOSTNAME_CONTENEUR =
  "Nom d’hôte vu à l’intérieur du conteneur (commande hostname, journaux). Distinct du nom du conteneur et des alias DNS sur le réseau Docker.";

export const AIDE_DOMAINNAME =
  "Champ DNS « domaine » associé au conteneur dans la configuration Docker ; rarement nécessaire pour des services courants. Laisser vide sauf besoin précis d’image ou d’appli.";

export const AIDE_ADRESSE_MAC =
  "Adresse MAC de l’interface réseau du conteneur sur certains pilotes ; laisser vide en général (Docker attribue une adresse). Une valeur incorrecte peut empêcher la création.";

export const AIDE_SIGNAL_ARRET =
  "Signal envoyé par Docker pour arrêter proprement le processus principal (ex. SIGTERM). Vide = défaut de l’image ou du moteur.";

export const AIDE_PLATEFORME_DOCKER =
  "Architecture cible lors du tirage d’image (ex. linux/arm64 sur hôte amd64 via émulation). Vide = plateforme de l’hôte.";

export const AIDE_DELAI_ARRET =
  "Nombre de secondes entre le signal d’arrêt et le passage au kill forcé. 0 laisse le moteur appliquer sa valeur par défaut si le champ est omis côté API.";

export const AIDE_RESEAU_DESACTIVE =
  "Si coché, le conteneur n’a pas d’interface réseau utilisable : utile seulement pour des cas isolés ; la plupart des images ont besoin du réseau.";

export const AIDE_ATTACHER_STDIN =
  "Indique au moteur de préparer le flux d’entrée standard pour une attache (docker attach). Souvent utilisé avec un shell interactif.";

export const AIDE_ATTACHER_STDOUT =
  "Prépare la sortie standard pour une attache ou les journaux ; la plupart des services laissent la valeur par défaut du moteur.";

export const AIDE_ATTACHER_STDERR =
  "Prépare la sortie d’erreur pour une attache ou les journaux ; idem sortie standard pour les usages courants.";

export const AIDE_STDIN_UNE_FOIS =
  "Ferme l’entrée standard après la première session attachée ; usage avancé, laisser décoché sauf besoin documenté.";

export const AIDE_MODE_RESEAU =
  "Pile réseau du conteneur : bridge (défaut), host (réseau de l’hôte), none, ou nom d’un réseau Docker existant. host supprime l’isolation des ports publiés classiques.";

export const AIDE_LIAISON_PORTS =
  "Expose un port du conteneur sur l’hôte : une ligne = port conteneur/protocole = port hôte, optionnellement ip:port hôte (ex. 80/tcp=8080 ou 80/tcp=127.0.0.1:8080).";

export const AIDE_DNS_SERVEURS =
  "Liste de résolveurs DNS utilisés par le conteneur (adresses IP), séparés par des virgules. Vide = résolution héritée du moteur ou du réseau.";

export const AIDE_DNS_SEARCH =
  "Suffixes de recherche DNS (équivalent search dans resolv.conf), séparés par des virgules. Vide = comportement par défaut.";

export const AIDE_DNS_OPTIONS =
  "Options brutes du résolveur (forme attendue par le moteur Docker), séparées par des virgules. Usage avancé ; laisser vide en général.";

export const AIDE_EXTRA_HOSTS =
  "Entrées statiques fichier hosts du conteneur, forme nom:ip, séparées par des virgules (ex. monservice:10.0.0.5).";

export const AIDE_PUBLIER_TOUS_PORTS =
  "Publie automatiquement chaque port déjà déclaré dans l’image sur des ports éphémères de l’hôte ; utile pour déboguer, moins pour la production fixe.";

export const AIDE_VARIABLES_ENVIRONNEMENT =
  "Variables d’environnement du processus principal : une ligne = CLE=VALEUR. Les images documentent les clés attendues (ex. POSTGRES_PASSWORD).";

export const AIDE_ETIQUETTES =
  "Paires clé=valeur attachées au conteneur pour le filtrage, l’orchestration ou les outils (une ligne = CLE=VALEUR).";

export const AIDE_BINDS =
  "Montages de fichiers ou répertoires de l’hôte dans le conteneur, syntaxe Docker (ex. /donnees:/var/lib/postgresql/data ou chemin:chemin:ro).";

export const AIDE_MODE_IPC =
  "Partage de mémoire et IPC entre conteneurs : vide par défaut ; shareable pour permettre à d’autres conteneurs de s’y rattacher ; host partage l’IPC de l’hôte.";

export const AIDE_MODE_PID =
  "Espace de noms des processus : vide = isolé ; host voit les processus de l’hôte (droits élevés, cas très spécifiques).";

export const AIDE_MODE_UTS =
  "Espace de noms du nom d’hôte : host aligne le hostname sur l’hôte ; laisser vide pour l’isolation normale.";

export const AIDE_MODE_USERNS =
  "Mode user namespace du moteur ; valeurs spécifiques à la configuration de l’hôte. Laisser vide sauf besoin documenté.";

export const AIDE_CGROUPNS =
  "Visibilité des cgroups du conteneur : private (défaut récent) ou host pour partager la hiérarchie de l’hôte. Laisser « défaut moteur » si vous ne savez pas.";

export const AIDE_RUNTIME_OCI =
  "Nom du runtime OCI (souvent runc ou runsc). Vide = runtime par défaut du moteur.";

export const AIDE_MEMOIRE_RESERVEE =
  "Mémoire minimale réservée au conteneur (en Mo) : le moteur tente de ne pas la réattribuer. Optionnel ; complément de la limite mémoire ci-dessous.";

export const AIDE_MEMOIRE_SWAP =
  "Plafond combiné RAM+swap en Mo pour le cgroup (sémantique Docker). -1 enlève une limite stricte de swap selon version du moteur ; se renseigner avant d’utiliser en production.";

export const AIDE_SWAPPINESS =
  "Agressivité du swap pour ce cgroup (-1 à 100, vide = défaut du moteur). Valeur basse = moins de swap.";

export const AIDE_OOM_KILL_DESACTIVE =
  "Si coché, le noyau peut ne pas tuer le processus en cas de dépassement mémoire : risque de gel de la machine ; usage très exceptionnel.";

export const AIDE_OOM_SCORE_ADJ =
  "Priorité relative du conteneur face au tueur OOM du noyau (valeurs négatives = moins susceptible d’être tué).";

export const AIDE_BLKIO_WEIGHT =
  "Part relative de bande passante disque entre conteneurs (10 à 1000). Vide = pas de pondération explicite.";

export const AIDE_CGROUP_PARENT =
  "Chemin d’un groupe cgroup parent sur l’hôte pour classer le conteneur. Vide = hiérarchie par défaut du moteur.";

export const AIDE_PILOTE_VOLUME =
  "Nom du pilote pour les volumes anonymes ou déclarés sans pilote explicite. Vide = pilote par défaut (local).";

export const AIDE_VOLUMES_FROM =
  "Réutilise les montages d’un autre conteneur ou d’une image (une ligne = identifiant ou syntaxe Docker volumes from).";

export const AIDE_DEVICE_CGROUP_RULES =
  "Règles cgroup pour exposer des périphériques au conteneur (une ligne = une règle). Usage avancé matériel.";

export const AIDE_CONSOLE_HAUTEUR =
  "Hauteur (lignes) de la console TTY signalée au moteur ; renseigner aussi la largeur pour que la paire soit envoyée.";

export const AIDE_CONSOLE_LARGEUR =
  "Largeur (colonnes) de la console TTY ; les deux champs hauteur et largeur sont requis ensemble pour activer l’option.";

export const AIDE_PRIVILEGIE =
  "Accorde au conteneur quasiment les mêmes droits que root sur l’hôte : à éviter sauf contrainte forte (certaines images legacy).";

export const AIDE_RACINE_LECTURE_SEULE =
  "Rend la racine du système de fichiers du conteneur non modifiable ; incompatible avec des images qui doivent écrire hors volumes.";

export const AIDE_CAP_ADD =
  "Liste de capacités Linux à ajouter au jeu par défaut (noms Linux, séparés par des virgules, ex. NET_ADMIN).";

export const AIDE_CAP_DROP =
  "Liste de capacités à retirer pour durcir le conteneur (ex. ALL ou noms précis selon la politique).";

export const AIDE_SECURITY_OPT =
  "Options de sécurité du moteur (ex. no-new-privileges), séparées par des virgules.";

export const AIDE_MEMOIRE_LIMITE =
  "Plafond de mémoire vive en mébibytes (Mo ici = mégaoctets saisis × 1024² côté envoi). Vide = pas de limite explicite au-delà des défauts du moteur.";

export const AIDE_NANO_CPUS =
  "Quota CPU en unités « nano CPUs » Docker (1e-9 cœur, ex. 1_000_000_000 = 1 cœur). Vide = pas de quota explicite.";

export const AIDE_POLITIQUE_REDEMARRAGE =
  "Comportement après arrêt : always redémarre toujours ; unless-stopped sauf arrêt manuel ; on-failure seulement sur code d’erreur ; no jamais.";

export const AIDE_TENTATIVES_ON_FAILURE =
  "Nombre maximal de redémarrages automatiques lorsque la politique est on-failure.";

export const AIDE_TTY =
  "Alloue un terminal pseudo-tty : nécessaire pour beaucoup de shells interactifs et certaines barres de progression ; les journaux bruts peuvent différer.";

export const AIDE_OUVRIR_STDIN =
  "Garde l’entrée standard ouverte (OpenStdin) : à combiner avec TTY pour un shell interactif ; sans processus long, le conteneur peut quand même s’arrêter.";

export const AIDE_JSON_HEALTHCHECK =
  "Objet JSON de contrôle de santé (champs intervalSeconds, test en tableau de chaînes, etc.). Vide = santé définie par l’image ou absente.";

export const AIDE_JSON_RESEAU =
  "Objet networkingConfig (ex. endpointsConfig pour joindre un réseau nommé avec alias ou IP). Vide = réseau selon mode réseau et pont par défaut.";

export const AIDE_JSON_HOSTCONFIG =
  "Fragment JSON fusionné dans hostConfig après les champs du formulaire ; utiliser les noms de l’API Docker en PascalCase pour coller à Portainer (ex. DeviceRequests).";
