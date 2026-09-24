import { z } from 'zod';

export const controlBodySchema = z.object({
  probeId: z.string().optional(),
  probeUuid: z.string().optional(),
  relay: z.enum(['on', 'off']).optional(),
  pump: z.boolean().optional(),
  durationMs: z.number().int().min(0).max(300000).optional(),
  buzzerMs: z.number().int().min(0).max(60000).optional()
}).refine(data => data.probeId || data.probeUuid, {
  message: "Either probeId or probeUuid is required"
}).refine(data => data.relay !== undefined || data.pump !== undefined, {
  message: "Either relay or pump command is required"
});
