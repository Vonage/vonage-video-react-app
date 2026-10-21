import { z } from 'zod';
import type { CaptionOptions } from '@vonage/video';
import CaptionsTranslationLevelSchema from './CaptionsTranslationLevel.schema';

export const CaptionOptionsSchema = z.object({
  languageCode: z.string().optional(),
  maxDuration: z.number().optional(),
  partialCaptions: z.enum(['true', 'false']).optional(),
  statusCallbackUrl: z.string().optional(),
  translationLevel: CaptionsTranslationLevelSchema.optional(),
}) satisfies z.ZodType<CaptionOptions>;

export default CaptionOptionsSchema;
