/** Liaison du port hôte vers un port conteneur (ex. `"80/tcp"`). */
export interface PortBinding {
  hostIp?: string;
  hostPort: string;
}

/** Politique de redémarrage alignée sur `HostConfig.RestartPolicy` Docker. */
export interface PolitiqueRedemarrageConteneur {
  name: "no" | "always" | "on-failure" | "unless-stopped";
  maximumRetryCount?: number;
}

/** Entrée ulimit pour la création (`HostConfig.Ulimits`). */
export interface UlimitConteneur {
  name: string;
  soft: number;
  hard: number;
}

/** Périphérique exposé au conteneur (`HostConfig.Devices`). */
export interface PeripheriqueConteneur {
  pathOnHost: string;
  pathInContainer: string;
  cgroupPermissions?: string;
}

/** Pilote des journaux Docker (`HostConfig.LogConfig`). */
export interface ConfigurationJournauxConteneur {
  type: string;
  config?: Record<string, string>;
}

/** Élément `Mounts` au format API Docker Engine (clés PascalCase). */
export type MontageMoteurDocker = Record<string, unknown> & {
  Type: string;
  Target: string;
};

/** Paramètres du contrôle de santé (`Config.Healthcheck`). */
export interface HealthcheckConteneur {
  test: string[];
  intervalSeconds?: number;
  timeoutSeconds?: number;
  retries?: number;
  startPeriodSeconds?: number;
}

/** Réglages d’un point de terminaison pour `NetworkingConfig.EndpointsConfig`. */
export interface ParametresPointReseauConteneur {
  aliases?: string[];
  ipv4Address?: string;
  ipv6Address?: string;
}

/** Attachement réseau à la création (`NetworkingConfig`). */
export interface ConfigurationReseauCreationConteneur {
  endpointsConfig?: Record<string, ParametresPointReseauConteneur>;
}

export interface ContainerHostConfig {
  /** Limite mémoire en octets (champ Docker `HostConfig.Memory`). */
  memoryBytes?: number;
  /** Quota CPU en milliardièmes de cœur (champ Docker `HostConfig.NanoCpus`). */
  nanoCpus?: number;
  /** Association port conteneur → liaisons côté hôte. */
  portBindings?: Record<string, PortBinding[]>;
  /** Supprimer le conteneur après arrêt (`HostConfig.AutoRemove`). */
  autoRemove?: boolean;
  /** Montages : chemin hôte → chemin conteneur (syntaxe Docker `Binds`). */
  binds?: string[];
  restartPolicy?: PolitiqueRedemarrageConteneur;
  /** Mode réseau (`HostConfig.NetworkMode`), ex. `bridge`, `host`, `none`, `container:nom`. */
  networkMode?: string;
  privileged?: boolean;
  /** Système de fichiers racine en lecture seule (`HostConfig.ReadonlyRootfs`). */
  readonlyRootfs?: boolean;
  publishAllPorts?: boolean;
  dns?: string[];
  dnsSearch?: string[];
  /** Options DNS brutes (`HostConfig.DnsOptions`). */
  dnsOptions?: string[];
  extraHosts?: string[];
  capAdd?: string[];
  capDrop?: string[];
  securityOpts?: string[];
  /** Taille du segment mémoire partagée en octets (`HostConfig.ShmSize`). */
  shmSizeBytes?: number;
  /** Montages tmpfs : chemin → options (`HostConfig.Tmpfs`). */
  tmpfs?: Record<string, string>;
  ulimits?: UlimitConteneur[];
  sysctls?: Record<string, string>;
  groupAdd?: string[];
  /** Processus `init` comme PID 1 (`HostConfig.Init`). */
  init?: boolean;
  cpuShares?: number;
  cpuPeriod?: number;
  cpuQuota?: number;
  cpusetCpus?: string;
  cpusetMems?: string;
  pidsLimit?: number;
  storageOpt?: Record<string, string>;
  devices?: PeripheriqueConteneur[];
  logConfig?: ConfigurationJournauxConteneur;
  /** Mode IPC (`HostConfig.IpcMode`). */
  ipcMode?: string;
  /** Espace de noms PID (`HostConfig.PidMode`). */
  pidMode?: string;
  /** Mode UTS (`HostConfig.UTSMode`). */
  utsMode?: string;
  /** Mode utilisateur (`HostConfig.UsernsMode`). */
  usernsMode?: string;
  /** Mode cgroup v2 (`HostConfig.CgroupnsMode`). */
  cgroupnsMode?: "private" | "host";
  /** Runtime OCI (`HostConfig.Runtime`). */
  runtime?: string;
  /** Montages structurés (`HostConfig.Mounts`). */
  mounts?: MontageMoteurDocker[];
  /** Mémoire réservée en octets (`HostConfig.MemoryReservation`). */
  memoryReservationBytes?: number;
  /** Limite mémoire + swap en octets (`HostConfig.MemorySwap`, -1 pour illimité côté moteur si transmis). */
  memorySwapBytes?: number;
  /** Agressivité du swap (`HostConfig.MemorySwappiness`, -1 pour défaut moteur). */
  memorySwappiness?: number;
  /** Désactive le tueur OOM (`HostConfig.OomKillDisable`). */
  oomKillDisable?: boolean;
  /** Ajustement de score OOM (`HostConfig.OomScoreAdj`). */
  oomScoreAdj?: number;
  /** Pondération blkio (`HostConfig.BlkioWeight`). */
  blkioWeight?: number;
  /** Groupe cgroup parent (`HostConfig.CgroupParent`). */
  cgroupParent?: string;
  /** Pilote de volume par défaut (`HostConfig.VolumeDriver`). */
  volumeDriver?: string;
  /** Conteneurs ou volumes source (`HostConfig.VolumesFrom`). */
  volumesFrom?: string[];
  /** Règles cgroup de périphériques (`HostConfig.DeviceCgroupRules`). */
  deviceCgroupRules?: string[];
  /** Taille console [hauteur, largeur] (`HostConfig.ConsoleSize`). */
  consoleSize?: [number, number];
}

/**
 * Spécification de création de haut niveau, traduite vers l’API Docker Engine par {@link ContainerEngine}.
 */
export interface ContainerCreateSpec {
  /** Nom du conteneur (paramètre de requête Docker `name`). */
  name?: string;
  /** Référence d’image, ex. `nginx:alpine`. */
  image: string;
  /** Arguments du processus principal (`Cmd`). */
  cmd?: string[];
  /** Point d’entrée (`Entrypoint`). */
  entrypoint?: string[];
  /** Répertoire de travail (`WorkingDir`). */
  workingDir?: string;
  /** Utilisateur ou uid:gid (`User`). */
  user?: string;
  /** Nom d’hôte du conteneur (`Hostname`). */
  hostname?: string;
  domainname?: string;
  macAddress?: string;
  /** Signal d’arrêt (`StopSignal`). */
  stopSignal?: string;
  env?: Record<string, string>;
  labels?: Record<string, string>;
  /** Clés du type `"80/tcp"` avec valeur objet vide (`ExposedPorts`). */
  exposedPorts?: string[];
  hostConfig?: ContainerHostConfig;
  networkingConfig?: ConfigurationReseauCreationConteneur;
  healthcheck?: HealthcheckConteneur;
  /** Attacher l’entrée standard (`OpenStdin`). */
  openStdin?: boolean;
  /** Allouer un TTY (`Tty`). */
  tty?: boolean;
  /** Attacher stdin au flux (`AttachStdin`). */
  attachStdin?: boolean;
  /** Attacher stdout au flux (`AttachStdout`). */
  attachStdout?: boolean;
  /** Attacher stderr au flux (`AttachStderr`). */
  attachStderr?: boolean;
  /** Fermer stdin après un seul client attaché (`StdinOnce`). */
  stdinOnce?: boolean;
  /** Plateforme cible (`platform` côté API de création). */
  platform?: string;
  /** Délai d’arrêt en secondes (`StopTimeout`). */
  stopTimeout?: number;
  /** Désactiver la pile réseau du conteneur (`NetworkDisabled`). */
  networkDisabled?: boolean;
  /** Points de montage déclaratifs hérités (`Volumes` dans la config de création). */
  volumes?: Record<string, object>;
  /** Instructions `ONBUILD` pour une image en construction (`OnBuild`). */
  onBuild?: string[];
  /** Interpréteur shell pour formes d’image (`Shell`). */
  shell?: string[];
}

export type ContainerStatus =
  | "created"
  | "running"
  | "paused"
  | "restarting"
  | "removing"
  | "exited"
  | "dead"
  | "unknown";

export interface ContainerSummary {
  id: string;
  names: string[];
  image: string;
  imageId: string;
  command: string;
  created: number;
  status: string;
  state: ContainerStatus;
  labels: Record<string, string>;
  ports: Array<{
    privatePort: number;
    publicPort?: number;
    type: string;
    ip?: string;
  }>;
}

export interface CreateContainerResult {
  id: string;
  warnings: string[];
}
