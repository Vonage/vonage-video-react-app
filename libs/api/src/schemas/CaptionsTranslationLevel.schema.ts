import { z } from 'zod';

export const CAPTIONS_TRANSLATION_LEVEL = {
  finalsOnly: 'FINALS_ONLY',
  confidentPartials: 'CONFIDENT_PARTIALS',
  windowedPartials: 'WINDOWED_PARTIALS',
  allPartials: 'ALL_PARTIALS',
} as const;

export const CaptionsTranslationLevelSchema = z.enum([
  CAPTIONS_TRANSLATION_LEVEL.finalsOnly,
  CAPTIONS_TRANSLATION_LEVEL.confidentPartials,
  CAPTIONS_TRANSLATION_LEVEL.windowedPartials,
  CAPTIONS_TRANSLATION_LEVEL.allPartials,
]);

export type CaptionsTranslationLevel = z.infer<typeof CaptionsTranslationLevelSchema>;

export default CaptionsTranslationLevelSchema;
