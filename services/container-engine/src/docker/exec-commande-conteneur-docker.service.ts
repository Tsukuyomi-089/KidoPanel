import { Writable } from "node:stream";
import type { DockerClient } from "../docker-connection.js";

/**
 * Partie minimale du type `exec` dockerode utilisée pour le démarrage et l’inspection.
 */
type SessionExecDocker = {
  start(
    options: { hijack?: boolean; stdin?: boolean; Tty?: boolean },
    callback: (
      erreur: Error | null,
      flux?: NodeJS.ReadWriteStream & NodeJS.EventEmitter,
    ) => void,
  ): void;
  inspect(
    callback: (
      erreur: Error | null,
      donnees?: { ExitCode?: number | null },
    ) => void,
  ): void;
};

/**
 * Résultat d’une commande exécutée dans un conteneur (code de sortie et flux standard capturés).
 */
export type ResultatExecConteneurDocker = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

/**
 * Exécute une commande dans un conteneur via l’API Docker (`exec`), avec entrée standard optionnelle (fichier généré, script).
 */
export async function executerCommandeDansConteneurDocker(
  docker: DockerClient,
  containerId: string,
  cmd: readonly string[],
  stdinUtf8?: string,
): Promise<ResultatExecConteneurDocker> {
  const entreeStdin =
    stdinUtf8 !== undefined && stdinUtf8.length > 0 ? stdinUtf8 : undefined;
  const attachStdin = entreeStdin !== undefined;

  const conteneur = docker.getContainer(containerId);
  const sessionExec = await new Promise<SessionExecDocker>((resolve, reject) => {
      conteneur.exec(
        {
          Cmd: [...cmd],
          AttachStdout: true,
          AttachStderr: true,
          AttachStdin: attachStdin,
          Tty: false,
        },
        (erreur, execRetour) => {
          if (erreur !== null) {
            reject(erreur);
            return;
          }
          if (execRetour === undefined) {
            reject(new Error("Réponse exec Docker vide."));
            return;
          }
          resolve(execRetour as SessionExecDocker);
        },
      );
    },
  );

  const morceauxStdout: Buffer[] = [];
  const morceauxStderr: Buffer[] = [];

  const ecrivainStdout = new Writable({
    write(fragment: Buffer, _encodage, suite) {
      morceauxStdout.push(fragment);
      suite();
    },
  });
  const ecrivainStderr = new Writable({
    write(fragment: Buffer, _encodage, suite) {
      morceauxStderr.push(fragment);
      suite();
    },
  });

  await new Promise<void>((resolve, reject) => {
    sessionExec.start(
      { hijack: true, stdin: attachStdin, Tty: false },
      (erreurDemarrage, flux) => {
        if (erreurDemarrage !== null) {
          reject(erreurDemarrage);
          return;
        }
        if (flux === undefined) {
          reject(new Error("Flux exec Docker absent."));
          return;
        }
        if (attachStdin && entreeStdin !== undefined) {
          flux.write(Buffer.from(entreeStdin, "utf8"));
          flux.end();
        }
        docker.modem.demuxStream(flux, ecrivainStdout, ecrivainStderr);
        flux.on("end", () => {
          resolve();
        });
        flux.on("error", (e: Error) => {
          reject(e);
        });
      },
    );
  });

  const inspection = await new Promise<{ ExitCode?: number | null }>(
    (resolve, reject) => {
      sessionExec.inspect((erreurInspect, donnees) => {
        if (erreurInspect !== null) {
          reject(erreurInspect);
          return;
        }
        if (donnees === undefined) {
          reject(new Error("Inspection exec Docker vide."));
          return;
        }
        resolve(donnees);
      });
    },
  );

  const codeSortie =
    typeof inspection.ExitCode === "number" ? inspection.ExitCode : -1;

  return {
    exitCode: codeSortie,
    stdout: Buffer.concat(morceauxStdout).toString("utf8"),
    stderr: Buffer.concat(morceauxStderr).toString("utf8"),
  };
}
