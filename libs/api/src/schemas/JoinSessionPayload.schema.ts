import { z } from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import ClientTokenOptionsSchema from './ClientTokenOptions.schema';

export const JoinSessionPayloadSchema = VideoPayloadSchema.extend({
  clientTokenOptions: ClientTokenOptionsSchema.optional(),
});

export type JoinSessionPayload = z.infer<typeof JoinSessionPayloadSchema>;

export function assertJoinSessionPayload(payload: unknown): asserts payload is JoinSessionPayload {
  JoinSessionPayloadSchema.parse(payload);
}

export default JoinSessionPayloadSchema;
