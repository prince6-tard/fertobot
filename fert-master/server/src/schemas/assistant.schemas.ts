import { z } from 'zod';

export const chatBodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).max(20).optional()
});
