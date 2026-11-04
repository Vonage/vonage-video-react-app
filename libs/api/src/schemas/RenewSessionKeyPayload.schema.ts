import { z } from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const RenewSessionKeyPayloadSchema = VideoPayloadSchema.extend({
  grant: z.string().nonempty(),
});

export type RenewSessionKeyPayload = z.infer<typeof RenewSessionKeyPayloadSchema>;

export default RenewSessionKeyPayloadSchema;
