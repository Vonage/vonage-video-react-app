import { z } from 'zod';
import BaseArchiveOptionsSchema from './BaseArchiveOptions.schema';

export const ArchiveWithTranscriptionSchema = BaseArchiveOptionsSchema.extend({
  hasTranscription: z.literal(true),
  transcriptionProperties: z.object({
    primaryLanguageCode: z.string().optional(),
    hasSummary: z.boolean().optional(),
  }),
});

export type ArchiveWithTranscription = z.infer<typeof ArchiveWithTranscriptionSchema>;

export default ArchiveWithTranscriptionSchema;
