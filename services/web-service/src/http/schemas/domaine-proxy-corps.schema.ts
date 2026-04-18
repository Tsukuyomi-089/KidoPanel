import { z } from "zod";

export const corpsAjoutDomaineProxySchema = z.object({
  domaine: z.string().min(1).max(253),
  webInstanceId: z.string().uuid(),
  portCible: z.number().int().min(1).max(65535),
});
