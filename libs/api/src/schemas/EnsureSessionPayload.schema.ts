import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import SessionOptionsSchema from './SessionOptions.schema';

export const EnsureSessionPayloadSchema = VideoPayloadSchema.extend({
  sessionId: VideoPayloadSchema.shape.sessionId.nullish(),
  sessionOptions: SessionOptionsSchema.optional(),
});

export type EnsureSessionPayload = z.infer<typeof EnsureSessionPayloadSchema>;

export function assertEnsureSessionPayload(
  payload: unknown
): asserts payload is EnsureSessionPayload {
  EnsureSessionPayloadSchema.parse(payload);
}

export default EnsureSessionPayloadSchema;
