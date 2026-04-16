import { SessionIdSchema } from '@node/schemas';
import z from 'zod';

export const VideoPayloadSchema = z.object({
  sessionId: SessionIdSchema,
});

export type VideoPayload = z.infer<typeof VideoPayloadSchema>;

export default VideoPayloadSchema;
