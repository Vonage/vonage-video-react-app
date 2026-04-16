import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import CaptionOptionsSchema from './CaptionOptions.schema';
import type { SessionId } from '@common/types';

export const EnableCaptionsPayloadSchema = VideoPayloadSchema.extend({
  captionOptions: CaptionOptionsSchema.optional(),
});

export type EnableCaptionsPayload = z.infer<typeof EnableCaptionsPayloadSchema>;

export function assertEnableCaptionsPayload(
  payload: unknown
): asserts payload is EnableCaptionsPayload & {
  sessionId: SessionId;
} {
  EnableCaptionsPayloadSchema.parse(payload);
}

export default EnableCaptionsPayloadSchema;
