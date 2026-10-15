import { z } from 'zod';

export const TranscriptionPropertiesSchema = z.object({
  primaryLanguageCode: z.string().optional(),
  hasSummary: z.boolean().optional(),
  hasTranscription: z.boolean().optional(),
});

export type TranscriptionProperties = z.infer<typeof TranscriptionPropertiesSchema>;

export default TranscriptionPropertiesSchema;
