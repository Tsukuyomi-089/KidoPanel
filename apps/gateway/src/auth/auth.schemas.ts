import { z } from "zod";

/** Corps attendu pour l’inscription d’un nouveau compte. */
export const corpsInscriptionSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

/** Corps attendu pour la connexion. */
export const corpsConnexionSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export type CorpsInscription = z.infer<typeof corpsInscriptionSchema>;
export type CorpsConnexion = z.infer<typeof corpsConnexionSchema>;
