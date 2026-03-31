import { z } from 'zod';
import BaseArchiveOptionsSchema from './BaseArchiveOptions.schema';

export const ArchiveWithoutTranscriptionSchema = BaseArchiveOptionsSchema.extend({
  hasTranscription: z.literal(false).optional(),
}).omit({ transcriptionProperties: true });

export type ArchiveWithoutTranscription = z.infer<typeof ArchiveWithoutTranscriptionSchema>;

export default ArchiveWithoutTranscriptionSchema;
