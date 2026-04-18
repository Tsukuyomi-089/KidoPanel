import { z } from "zod";

const pilesWebAutorisees = [
  "NGINX_STATIC",
  "NODE_JS",
  "PHP_FPM",
  "PYTHON_WSGI",
  "CUSTOM",
] as const;

export const corpsCreationWebInstanceSchema = z
  .object({
    name: z.string().min(1).max(128),
    techStack: z.enum(pilesWebAutorisees),
    memoryMb: z.number().int().positive().max(131072),
    diskGb: z.number().int().positive().max(2000),
    env: z.record(z.string(), z.string()).optional(),
    portHote: z.number().int().min(0).max(65535).optional(),
    domaineInitial: z.string().min(1).max(253).optional(),
    gabaritDockerRapideId: z.string().min(1).max(64).optional(),
    reseauInterneUtilisateurId: z.string().uuid().optional(),
  })
  .superRefine((donnees, ctx) => {
    if (donnees.techStack === "CUSTOM") {
      const gid = donnees.gabaritDockerRapideId?.trim();
      if (gid === undefined || gid.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le gabarit Docker rapide est obligatoire pour la pile « personnalisée ».",
          path: ["gabaritDockerRapideId"],
        });
      }
    }
  });
