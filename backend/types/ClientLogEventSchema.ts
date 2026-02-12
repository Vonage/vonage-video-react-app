import { z } from 'zod';

export const ClientLogEventSchema = z.object({
  action: z.string().min(1),
  variation: z.string().optional(),
  sessionId: z.string().optional(),
  connectionId: z.string().optional(),
  clientSystemTime: z.number(),
  payload: z.record(z.string(), z.unknown()).optional(),
  source: z.string(),
  guid: z.string().min(1),
  level: z.enum(['info', 'error']),
  userAgent: z.string(),
  clientVersion: z.string().optional(),
  componentId: z.string().optional(),
  partnerId: z.string().optional(),
  logVersion: z.string().optional(),
  name: z.string().optional(),
});

/**
 * Frontend → Backend logging payload contract.
 *
 * **Must match** `libs/common/src/logger/ClientLogEvent.ts` so FE and BE can work in parallel.
 */
export type ClientLogEvent = z.infer<typeof ClientLogEventSchema>;
