import { z } from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import ClientTokenOptionsSchema from './ClientTokenOptions.schema';
import type { SessionId } from '@common/types';

export const CreateEphemeralTokenPayloadSchema = VideoPayloadSchema.extend({
  clientTokenOptions: ClientTokenOptionsSchema.optional(),
});

export type CreateEphemeralTokenPayload = z.infer<typeof CreateEphemeralTokenPayloadSchema>;

export function assertCreateEphemeralTokenPayload(
  payload: unknown
): asserts payload is CreateEphemeralTokenPayload & {
  sessionId: SessionId;
} {
  CreateEphemeralTokenPayloadSchema.parse(payload);
}

export default CreateEphemeralTokenPayloadSchema;
