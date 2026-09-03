import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const StopArchivePayloadSchema = VideoPayloadSchema.extend({
  // archiveId is optional - if not provided, backend will stop all active archives for the session
  archiveId: z.string().optional(),
});

export type StopArchivePayload = z.infer<typeof StopArchivePayloadSchema>;

export default StopArchivePayloadSchema;
