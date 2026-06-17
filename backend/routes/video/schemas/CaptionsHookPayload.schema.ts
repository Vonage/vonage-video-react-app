import { SessionIdSchema } from '@node/schemas';
import { z } from 'zod';
import CaptionsStatusSchema from './CaptionsStatus.schema';

const CaptionsHookPayloadSchema = z
  .object({
    captionId: z.string(),
    projectId: z.string(),
    sessionId: SessionIdSchema,

    status: CaptionsStatusSchema,

    createdAt: z.number(),
    updatedAt: z.number(),

    duration: z.number().optional(),
    reason: z.string().optional(),

    provider: z.string(),
    languageCode: z.string(),

    stream: z.object({
      streamId: z.string(),
      streamStatus: CaptionsStatusSchema,
    }),

    group: z.literal('captions'),
  })
  .loose();

export type CaptionsHookPayload = z.infer<typeof CaptionsHookPayloadSchema>;

export default CaptionsHookPayloadSchema;
