import { z } from 'zod';

const ArchiveStatusSchema = z.enum([
  'started',
  'paused',
  'stopped',
  'uploaded',
  'available',
  'expired',
  'failed',
  'streamAdded',
  'streamRemoved',
]);

const ArchiveHookPayloadSchema = z
  .object({
    id: z.string(),
    event: z.string(),
    sessionId: z.string(),
    status: ArchiveStatusSchema,
    name: z.string().optional(),
    createdAt: z.number(),
    duration: z.number(),
    partnerId: z.union([z.string(), z.number()]),
    resolution: z.string().optional(),
    size: z.number(),
    url: z.string().nullable(),
    reason: z.string(),
    streamMode: z.enum(['auto', 'manual']).optional(),
    streams: z
      .array(
        z.object({
          streamId: z.string(),
          hasAudio: z.boolean(),
          hasVideo: z.boolean(),
        })
      )
      .optional(),
    stream: z
      .object({
        id: z.string(),
        createdAt: z.number().optional(),
        connection: z.object({ id: z.string() }).optional(),
      })
      .optional(),
    timestamp: z.number().optional(),
  })
  .loose();

export type ArchiveHookPayload = z.infer<typeof ArchiveHookPayloadSchema>;

export default ArchiveHookPayloadSchema;
