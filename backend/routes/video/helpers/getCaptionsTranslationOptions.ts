import { z } from 'zod';
import { CaptionsTranslationLevelSchema, type CaptionsTranslationLevel } from '@api-lib';

export type CaptionsTranslationOptions = {
  translationLevel?: CaptionsTranslationLevel;
  targetLanguageCode?: string;
};

const emptyAsUndefined = (value: unknown) => (value === '' ? undefined : value);

const CaptionsTranslationEnvSchema = z.object({
  CAPTIONS_TRANSLATION_LEVEL: z.preprocess(
    emptyAsUndefined,
    CaptionsTranslationLevelSchema.optional()
  ),
  CAPTIONS_TARGET_LANGUAGE_CODE: z.preprocess(emptyAsUndefined, z.string().trim().optional()),
});

/**
 * Reads the optional caption translation options from the environment.
 * Unset variables are omitted so the Start Captions request stays unchanged.
 */
function getCaptionsTranslationOptions(): CaptionsTranslationOptions {
  const { CAPTIONS_TRANSLATION_LEVEL, CAPTIONS_TARGET_LANGUAGE_CODE } =
    CaptionsTranslationEnvSchema.parse(process.env);

  return {
    ...(CAPTIONS_TRANSLATION_LEVEL && { translationLevel: CAPTIONS_TRANSLATION_LEVEL }),
    ...(CAPTIONS_TARGET_LANGUAGE_CODE && { targetLanguageCode: CAPTIONS_TARGET_LANGUAGE_CODE }),
  };
}

export default getCaptionsTranslationOptions;
