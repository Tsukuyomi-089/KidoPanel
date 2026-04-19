import { existsSync } from "node:fs";

/**
 * Message d’aide lorsque ni firewalld ni UFW n’est détecté comme actif alors que les binaires peuvent être présents.
 */
export function redigerMessageDiagnosticAucunBackendPareFeuActif(): string {
  const cheminsFirewalld = ["/usr/bin/firewall-cmd", "/bin/firewall-cmd"];
  const cheminsUfw = ["/usr/sbin/ufw", "/sbin/ufw"];
  if (cheminsFirewalld.some((p) => existsSync(p))) {
    return "firewalld semble installé mais le service ne répond pas ou est inactif ; démarrez-le : sudo systemctl start firewalld";
  }
  if (cheminsUfw.some((p) => existsSync(p))) {
    return "UFW semble installé mais inactif ou sans « Status: active » ; activez-le : sudo ufw enable";
  }
  return "Aucun pare-feu géré détecté (firewalld / UFW actifs). Installez et activez l’un des deux, ou définissez CONTAINER_ENGINE_PAREFEU_BACKEND=none pour ignorer l’ouverture automatique des ports.";
}
