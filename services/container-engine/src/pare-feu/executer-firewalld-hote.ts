import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PublicationHotePareFeu } from "./types-publication-hote-pare-feu.js";

const executerFichier = promisify(execFile);

function argumentsZoneOptionnels(): string[] {
  const zone = process.env.CONTAINER_ENGINE_PAREFEU_ZONE?.trim();
  if (zone === undefined || zone.length === 0) {
    return [];
  }
  return [`--zone=${zone}`];
}

/** Construit la commande : soit `sudo -n firewall-cmd`, soit `firewall-cmd` seul si déjà root / sans sudo. */
function resoudreInvocationFirewallCmd(): {
  executable: string;
  argumentsVersFirewalld: string[];
} {
  const cheminBrut = process.env.CONTAINER_ENGINE_PAREFEU_FIREWALL_CMD?.trim();
  const sansSudo = process.env.CONTAINER_ENGINE_PAREFEU_SANS_SUDO?.trim() === "1";
  const binaire = cheminBrut !== undefined && cheminBrut.length > 0 ? cheminBrut : "firewall-cmd";
  if (!sansSudo) {
    return {
      executable: "sudo",
      argumentsVersFirewalld: ["-n", binaire],
    };
  }
  return { executable: binaire, argumentsVersFirewalld: [] };
}

/**
 * Indique si firewalld répond comme actif sur l’hôte (best-effort, sans lever d’exception).
 */
export async function testerFirewalldActifSurHote(): Promise<boolean> {
  const { executable, argumentsVersFirewalld } = resoudreInvocationFirewallCmd();
  try {
    await executerFichier(executable, [...argumentsVersFirewalld, "--state"], {
      timeout: 15_000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ouvre un port TCP/UDP sur le pare-feu (règle permanente + application immédiate).
 */
export async function ouvrirPortFirewalldHote(
  publication: PublicationHotePareFeu,
): Promise<{ ok: boolean; messageErreur?: string }> {
  const { executable, argumentsVersFirewalld } = resoudreInvocationFirewallCmd();
  const zone = argumentsZoneOptionnels();
  const spec = `${String(publication.numero)}/${publication.protocole}`;
  const argsPermanent = [
    ...argumentsVersFirewalld,
    ...zone,
    "--permanent",
    `--add-port=${spec}`,
  ];
  const argsRuntime = [...argumentsVersFirewalld, ...zone, `--add-port=${spec}`];
  try {
    await executerFichier(executable, argsPermanent, { timeout: 60_000 });
    await executerFichier(executable, argsRuntime, { timeout: 60_000 });
    return { ok: true };
  } catch (erreur) {
    const message =
      erreur instanceof Error ? erreur.message : String(erreur);
    return { ok: false, messageErreur: message };
  }
}

/**
 * Retire un port TCP/UDP du pare-feu (permanent et session).
 */
export async function fermerPortFirewalldHote(
  publication: PublicationHotePareFeu,
): Promise<{ ok: boolean; messageErreur?: string }> {
  const { executable, argumentsVersFirewalld } = resoudreInvocationFirewallCmd();
  const zone = argumentsZoneOptionnels();
  const spec = `${String(publication.numero)}/${publication.protocole}`;
  const argsPermanent = [
    ...argumentsVersFirewalld,
    ...zone,
    "--permanent",
    `--remove-port=${spec}`,
  ];
  const argsRuntime = [...argumentsVersFirewalld, ...zone, `--remove-port=${spec}`];
  try {
    await executerFichier(executable, argsPermanent, { timeout: 60_000 });
    await executerFichier(executable, argsRuntime, { timeout: 60_000 });
    return { ok: true };
  } catch (erreur) {
    const message =
      erreur instanceof Error ? erreur.message : String(erreur);
    return { ok: false, messageErreur: message };
  }
}
