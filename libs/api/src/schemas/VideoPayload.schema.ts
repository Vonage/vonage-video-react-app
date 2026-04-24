import z from 'zod';
import { SessionKeySchema } from '@node/schemas';

export const VideoPayloadSchema = z.object({
  sessionKey: SessionKeySchema,
});

export type VideoPayload = z.infer<typeof VideoPayloadSchema>;

export default VideoPayloadSchema;
