#!/usr/bin/env bash
# Installe les dépendances et prépare l’environnement pour exécuter KidoPanel sur une machine
# (Node, pnpm, PostgreSQL via Docker Compose, migrations Prisma, build monorepo).
# Tente d’installer Docker Compose V2 s’il manque (paquets ou binaire officiel).
# Ne démarre pas les services applicatifs : voir les instructions affichées en fin de script.

set -euo pipefail

RACINE_DEPOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RACINE_DEPOT"

# Version du binaire Compose (repli si les paquets système échouent).
VERSION_COMPOSE_BINAIRE="v2.32.2"

echo_err() {
  echo "$*" >&2
}

MODE_VERIFIER_SEULEMENT=0
SANS_POSTGRES_DOCKER=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --verifier)
      MODE_VERIFIER_SEULEMENT=1
      shift
      ;;
    --sans-postgres-docker)
      SANS_POSTGRES_DOCKER=1
      shift
      ;;
    -h | --help)
      echo "Usage : $0 [options]"
      echo "  --verifier             Vérifie uniquement les prérequis (Node, Docker, pnpm)."
      echo "  --sans-postgres-docker N’exécute pas « docker compose » (PostgreSQL déjà joignable via DATABASE_URL)."
      echo "Variable d’environnement : PANEL_INSTALLER_SANS_AUTO=1 désactive l’installation automatique de Compose."
      exit 0
      ;;
    *)
      echo_err "Option inconnue : $1 (utilisez --help)"
      exit 1
      ;;
  esac
done

# Commande Compose effective : tableau (« docker » « compose ») ou (« docker-compose »).
DOCKER_COMPOSE=()

definir_commande_compose_si_disponible() {
  DOCKER_COMPOSE=()
  if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE=(docker compose)
    return 0
  fi
  if command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE=(docker-compose)
    return 0
  fi
  return 1
}

executer_avec_privileges() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

architecture_compose_github() {
  case "$(uname -m)" in
    x86_64 | amd64)
      echo "x86_64"
      ;;
    aarch64 | arm64)
      echo "aarch64"
      ;;
    armv7l)
      echo "armv7"
      ;;
    *)
      echo ""
      ;;
  esac
}

installer_compose_via_paquets() {
  if [[ "${PANEL_INSTALLER_SANS_AUTO:-}" == "1" ]]; then
    return 1
  fi
  echo "Tentative d’installation du plugin Docker Compose via le gestionnaire de paquets…"
  if command -v apt-get >/dev/null 2>&1; then
    if executer_avec_privileges env DEBIAN_FRONTEND=noninteractive apt-get update -qq &&
      executer_avec_privileges env DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-plugin; then
      return 0
    fi
  fi
  if command -v dnf >/dev/null 2>&1; then
    if executer_avec_privileges dnf install -y docker-compose-plugin 2>/dev/null; then
      return 0
    fi
  fi
  if command -v yum >/dev/null 2>&1; then
    if executer_avec_privileges yum install -y docker-compose-plugin 2>/dev/null; then
      return 0
    fi
  fi
  if command -v zypper >/dev/null 2>&1; then
    if executer_avec_privileges zypper install -y docker-compose-plugin 2>/dev/null; then
      return 0
    fi
  fi
  if command -v apk >/dev/null 2>&1; then
    if executer_avec_privileges apk add --no-cache docker-cli-compose 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

installer_compose_via_binaire_officiel() {
  if [[ "${PANEL_INSTALLER_SANS_AUTO:-}" == "1" ]]; then
    return 1
  fi
  local arch url dest dir_plugin
  arch="$(architecture_compose_github)"
  if [[ -z "$arch" ]]; then
    echo_err "Architecture $(uname -m) non prise en charge pour le binaire Compose."
    return 1
  fi
  url="https://github.com/docker/compose/releases/download/${VERSION_COMPOSE_BINAIRE}/docker-compose-linux-${arch}"
  echo "Téléchargement de Docker Compose ${VERSION_COMPOSE_BINAIRE} depuis GitHub…"

  if [[ "$(id -u)" -eq 0 ]]; then
    dir_plugin="/usr/local/lib/docker/cli-plugins"
    executer_avec_privileges mkdir -p "$dir_plugin"
    dest="${dir_plugin}/docker-compose"
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL "$url" -o "$dest"
    elif command -v wget >/dev/null 2>&1; then
      wget -qO "$dest" "$url"
    else
      echo_err "Installez « curl » ou « wget » pour le téléchargement de Compose."
      return 1
    fi
    chmod +x "$dest"
    return 0
  fi

  dir_plugin="${HOME}/.docker/cli-plugins"
  mkdir -p "$dir_plugin"
  dest="${dir_plugin}/docker-compose"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$dest" "$url"
  else
    echo_err "Installez « curl » ou « wget », ou relancez le script en root pour une installation système."
    return 1
  fi
  chmod +x "$dest"
  return 0
}

assurer_docker_compose() {
  if definir_commande_compose_si_disponible; then
    echo "Prérequis OK : Compose disponible (« ${DOCKER_COMPOSE[*]} »)"
    return 0
  fi
  if [[ "${PANEL_INSTALLER_SANS_AUTO:-}" == "1" ]]; then
    echo_err "« docker compose » indisponible et installation automatique désactivée (PANEL_INSTALLER_SANS_AUTO=1)."
    return 1
  fi
  echo "« docker compose » absent : installation automatique…"
  installer_compose_via_paquets || true
  if definir_commande_compose_si_disponible; then
    echo "Prérequis OK : Docker Compose installé via paquets (« ${DOCKER_COMPOSE[*]} »)"
    return 0
  fi
  if installer_compose_via_binaire_officiel; then
    if definir_commande_compose_si_disponible; then
      echo "Prérequis OK : Docker Compose installé (binaire plugin « ${DOCKER_COMPOSE[*]} »)"
      return 0
    fi
  fi
  echo_err "Impossible d’installer Docker Compose automatiquement."
  echo_err "Installez le paquet « docker-compose-plugin » (Debian/Ubuntu : apt install docker-compose-plugin) ou consultez :"
  echo_err "https://docs.docker.com/compose/install/linux/"
  return 1
}

verifier_version_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo_err "Node.js est absent : installez Node 18.12 ou supérieur (ex. via https://nodejs.org ou votre gestionnaire de paquets)."
    return 1
  fi
  local maj
  maj="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
  if [[ "$maj" -lt 18 ]]; then
    echo_err "Node.js $(node -v) est trop ancien : version minimale 18.12."
    return 1
  fi
  echo "Prérequis OK : Node $(node -v)"
}

verifier_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo_err "Docker CLI absent : installez Docker Engine et ajoutez l’utilisateur au groupe « docker » si besoin."
    return 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo_err "Docker ne répond pas (« docker info » échoue). Démarrez le démon et vérifiez les permissions."
    return 1
  fi
  echo "Prérequis OK : Docker joignable"
}

verifier_compose_uniquement() {
  if definir_commande_compose_si_disponible; then
    echo "Prérequis OK : « ${DOCKER_COMPOSE[*]} » disponible"
    return 0
  fi
  echo_err "« docker compose » indisponible : installez Docker Compose V2 ou relancez le script sans --verifier pour installation auto."
  return 1
}

activer_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "Prérequis OK : pnpm $(pnpm -v)"
    return 0
  fi
  if command -v corepack >/dev/null 2>&1; then
    echo "Activation de pnpm via corepack (version du dépôt)…"
    corepack enable
    corepack prepare pnpm@10.33.0 --activate
    echo "Prérequis OK : pnpm $(pnpm -v)"
    return 0
  fi
  echo_err "pnpm absent et corepack indisponible : installez Node récent ou « npm install -g pnpm »."
  return 1
}

preparer_fichier_env_racine() {
  if [[ -f "$RACINE_DEPOT/.env" ]]; then
    echo "Fichier .env à la racine déjà présent (non écrasé)."
    return 0
  fi
  if [[ ! -f "$RACINE_DEPOT/.env.example" ]]; then
    echo_err "Fichier .env.example introuvable à la racine du dépôt."
    return 1
  fi
  cp "$RACINE_DEPOT/.env.example" "$RACINE_DEPOT/.env"
  local secret
  if command -v openssl >/dev/null 2>&1; then
    secret="$(openssl rand -base64 48 | tr -d '\n')"
  else
    secret="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
  fi
  if grep -q '^GATEWAY_JWT_SECRET=' "$RACINE_DEPOT/.env"; then
    sed -i "s|^GATEWAY_JWT_SECRET=.*|GATEWAY_JWT_SECRET=${secret}|" "$RACINE_DEPOT/.env"
  else
    echo "GATEWAY_JWT_SECRET=${secret}" >>"$RACINE_DEPOT/.env"
  fi
  echo "Fichier .env créé depuis .env.example avec un GATEWAY_JWT_SECRET généré."
}

preparer_env_web() {
  local defaut="http://127.0.0.1:3000"
  if [[ -f "$RACINE_DEPOT/apps/web/.env" ]] || [[ -f "$RACINE_DEPOT/apps/web/.env.local" ]]; then
    echo "apps/web : .env ou .env.local déjà présent (non modifié)."
    return 0
  fi
  printf 'VITE_GATEWAY_BASE_URL=%s\n' "$defaut" >"$RACINE_DEPOT/apps/web/.env"
  echo "Créé apps/web/.env avec VITE_GATEWAY_BASE_URL=${defaut} (à adapter si le navigateur n’est pas sur la même machine)."
}

demarrer_postgres_et_attendre() {
  verifier_docker
  assurer_docker_compose
  "${DOCKER_COMPOSE[@]}" -f "$RACINE_DEPOT/docker-compose.yml" up -d
  echo "Attente de la disponibilité de PostgreSQL…"
  local tentatives=0
  while [[ $tentatives -lt 60 ]]; do
    if "${DOCKER_COMPOSE[@]}" -f "$RACINE_DEPOT/docker-compose.yml" exec -T postgres \
      pg_isready -U kydopanel -d kydopanel >/dev/null 2>&1; then
      echo "PostgreSQL prêt."
      return 0
    fi
    tentatives=$((tentatives + 1))
    sleep 1
  done
  echo_err "PostgreSQL n’est pas devenu joignable à temps (vérifiez « ${DOCKER_COMPOSE[*]} logs postgres »)."
  return 1
}

charger_env_pour_prisma() {
  set -a
  # shellcheck source=/dev/null
  source "$RACINE_DEPOT/.env"
  set +a
}

if [[ "$MODE_VERIFIER_SEULEMENT" -eq 1 ]]; then
  verifier_version_node
  verifier_docker
  verifier_compose_uniquement
  activer_pnpm
  echo "Toutes les vérifications demandées ont réussi."
  exit 0
fi

verifier_version_node
activer_pnpm

if [[ "$SANS_POSTGRES_DOCKER" -eq 0 ]]; then
  demarrer_postgres_et_attendre
else
  echo "Option --sans-postgres-docker : aucun conteneur PostgreSQL lancé par ce script."
  verifier_docker
fi

preparer_fichier_env_racine
preparer_env_web

if [[ ! -f "$RACINE_DEPOT/.env" ]]; then
  echo_err "Impossible de poursuivre sans fichier .env à la racine."
  exit 1
fi

echo "Installation des dépendances pnpm (monorepo)…"
pnpm install --frozen-lockfile

echo "Migrations Prisma (package @kidopanel/database)…"
charger_env_pour_prisma
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo_err "DATABASE_URL est vide dans .env : corrigez avant de relancer."
  exit 1
fi
pnpm --filter @kidopanel/database run db:migrate

echo "Build complet (turbo)…"
pnpm run build

echo ""
echo "=== Installation terminée ==="
echo "Variables chargées depuis la racine : utilisez « set -a », « source .env », « set +a » avant de lancer les services."
echo ""
echo "Terminal 1 — moteur conteneurs (accès Docker requis) :"
echo "  cd \"$RACINE_DEPOT\" && set -a && source .env && set +a && pnpm --filter container-engine start"
echo ""
echo "Terminal 2 — passerelle API :"
echo "  cd \"$RACINE_DEPOT\" && set -a && source .env && set +a && pnpm --filter gateway start"
echo ""
echo "Terminal 3 — interface web (développement) :"
echo "  cd \"$RACINE_DEPOT\" && pnpm --filter web dev"
echo ""
echo "Contrôles rapides : curl -s \"http://127.0.0.1:8787/health\" (moteur) ; curl -s \"http://127.0.0.1:3000/health\" (passerelle)."
echo ""
