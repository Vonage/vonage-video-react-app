import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const StopArchivePayloadSchema = VideoPayloadSchema.extend({
  archiveId: z.string(),
});

export type StopArchivePayload = z.infer<typeof StopArchivePayloadSchema>;

export default StopArchivePayloadSchema;
