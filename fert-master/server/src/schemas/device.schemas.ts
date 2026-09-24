import { z } from 'zod';

export const readingBodySchema = z.object({
  probeUuid: z.string().min(1),
  soilMoisture: z.number().min(0).max(100),
  temperature: z.number().min(-50).max(80),
  humidity: z.number().min(0).max(100).optional(),
  pH: z.number().min(0).max(14).optional(),
  conductivity: z.number().min(0).default(0),
  nitrogen: z.number().min(0).default(0),
  phosphorus: z.number().min(0).default(0),
  potassium: z.number().min(0).default(0),
  waterTankLevel: z.number().min(0).max(100).default(0),
  batteryLevel: z.number().min(0).max(100).default(100),
  signalStrength: z.number().min(0).max(100).default(100),
  motionDetected: z.boolean().default(false)
});

export const commandQuerySchema = z.object({
  probeUuid: z.string().min(1)
});

export const statusQuerySchema = z.object({
  probeUuid: z.string().min(1)
});
