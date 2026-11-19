import { z } from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const ExtendSessionPayloadSchema = VideoPayloadSchema.extend({
  minutes: z.number().int().positive(),
});

export type ExtendSessionPayload = z.infer<typeof ExtendSessionPayloadSchema>;

export default ExtendSessionPayloadSchema;
