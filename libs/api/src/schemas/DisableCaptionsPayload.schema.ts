import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import type { SessionId } from '@common/types';

export const DisableCaptionsPayloadSchema = VideoPayloadSchema.extend({
  captionsId: z.string(),
});

export type DisableCaptionsPayload = z.infer<typeof DisableCaptionsPayloadSchema>;

export function assertDisableCaptionsPayload(
  payload: unknown
): asserts payload is DisableCaptionsPayload & {
  sessionId: SessionId;
} {
  DisableCaptionsPayloadSchema.parse(payload);
}

export default DisableCaptionsPayloadSchema;
