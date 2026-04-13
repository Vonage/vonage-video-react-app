import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import CaptionOptionsSchema from './CaptionOptions.schema';

export const EnableCaptionsPayloadSchema = VideoPayloadSchema.extend({
  captionOptions: CaptionOptionsSchema.optional(),
});

export type EnableCaptionsPayload = z.infer<typeof EnableCaptionsPayloadSchema>;

export default EnableCaptionsPayloadSchema;
