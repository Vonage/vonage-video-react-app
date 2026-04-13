import { z } from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import ClientTokenOptionsSchema from './ClientTokenOptions.schema';

export const CreateEphemeralTokenPayloadSchema = VideoPayloadSchema.extend({
  clientTokenOptions: ClientTokenOptionsSchema.optional(),
});

export type CreateEphemeralTokenPayload = z.infer<typeof CreateEphemeralTokenPayloadSchema>;

export default CreateEphemeralTokenPayloadSchema;
