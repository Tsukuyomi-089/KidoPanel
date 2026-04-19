import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Résout le chemin absolu d’une commande via le shell POSIX (`command -v`), sans injection
 * (noms fixes firewall-cmd / ufw uniquement).
 */
async function cheminAbsoluCommandeOuVide(nomCommande: "firewall-cmd" | "ufw"): Promise<string> {
  try {
    const { stdout } = await execFileAsync("/bin/sh", ["-c", `command -v '${nomCommande}'`], {
      timeout: 3000,
      maxBuffer: 512,
    });
    const ligne = stdout.toString().trim().split(/\r?\n/).at(0)?.trim();
    return ligne ?? "";
  } catch {
    return "";
  }
}

/**
 * Message d’aide lorsque ni firewalld ni UFW n’est actif : détection des binaires présents sur le PATH système.
 */
export async function obtenirMessageDiagnosticAucunBackendPareFeuActif(): Promise<string> {
  const cheminFw = await cheminAbsoluCommandeOuVide("firewall-cmd");
  if (cheminFw.length > 0) {
    return "firewalld est installé mais inactif. Démarrez-le : sudo systemctl start firewalld";
  }
  const cheminUfw = await cheminAbsoluCommandeOuVide("ufw");
  if (cheminUfw.length > 0) {
    return "UFW est installé mais inactif. Activez-le : sudo ufw enable";
  }
  return (
    "Ni firewalld ni UFW trouvé sur le PATH. Installez et activez l’un des deux, ou définissez " +
    "CONTAINER_ENGINE_PAREFEU_BACKEND=none pour désactiver la gestion automatique des ports."
  );
}
