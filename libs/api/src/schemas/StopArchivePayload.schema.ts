import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const StopArchivePayloadSchema = VideoPayloadSchema.extend({
  archiveId: z.string().optional(),
  archiveType: z.enum(['recording', 'transcription']).optional(),
});

export type StopArchivePayload = z.infer<typeof StopArchivePayloadSchema>;

export default StopArchivePayloadSchema;
