import { z } from 'zod';
import type { CaptionOptions } from '@vonage/video';

export const CaptionOptionsSchema = z.object({
  languageCode: z.string().optional(),
  maxDuration: z.number().optional(),
  partialCaptions: z.enum(['true', 'false']).optional(),
  statusCallbackUrl: z.string().optional(),
}) satisfies z.ZodType<CaptionOptions>;

export default CaptionOptionsSchema;
