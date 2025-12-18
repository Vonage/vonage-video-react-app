import z from 'zod';
import GetOrCreateSessionSchema from './GetOrCreateSession';
import StartArchiveSchema from './StartArchive';
import StopArchiveSchema from './StopArchive';
import ListArchivesSchema from './ListArchives';
import EnableCaptionsSchema from './EnableCaptions';
import DisableCaptionsSchema from './DisableCaptions';

export const VeraActionRequestSchema = z.discriminatedUnion('action', [
  GetOrCreateSessionSchema,
  StartArchiveSchema,
  StopArchiveSchema,
  ListArchivesSchema,
  EnableCaptionsSchema,
  DisableCaptionsSchema,
]);

export type VeraActionRequest = z.infer<typeof VeraActionRequestSchema>;

export default VeraActionRequestSchema;
