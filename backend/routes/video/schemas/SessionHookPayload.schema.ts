import { z } from 'zod';

const SessionHookEventSchema = z.enum([
  'sessionCreated',
  'sessionDestroyed',
  'sessionNotification',
  'connectionCreated',
  'connectionDestroyed',
  'streamCreated',
  'streamDestroyed',
]);

const SessionHookPayloadSchema = z
  .object({
    sessionId: z.string(),
    event: SessionHookEventSchema,
    projectId: z.union([z.string(), z.number()]).optional(),
    timestamp: z.number().optional(),
    createdAt: z.number().optional(),
    reason: z.string().optional(),
    remainingTime: z.number().optional(),
  })
  .loose();

export type SessionHookPayload = z.infer<typeof SessionHookPayloadSchema>;

export default SessionHookPayloadSchema;
