import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import { RECORDING_ARCHIVE_NAME, TRANSCRIPTION_ARCHIVE_NAME } from '@common/constants';

export const StopArchivePayloadSchema = VideoPayloadSchema.extend({
  archiveId: z.string().optional(),
  archiveType: z.enum([RECORDING_ARCHIVE_NAME, TRANSCRIPTION_ARCHIVE_NAME]).optional(),
});

export type StopArchivePayload = z.infer<typeof StopArchivePayloadSchema>;

export default StopArchivePayloadSchema;
