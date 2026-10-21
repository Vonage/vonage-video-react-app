import { z } from 'zod';
import type { CaptionsLanguageCode } from '@vonage/client-sdk-video';

export const CAPTIONS_TRANSLATION_LANGUAGES = [
  'af-ZA',
  'ar-AE',
  'ar-SA',
  'eu-ES',
  'ca-ES',
  'zh-HK',
  'zh-CN',
  'zh-TW',
  'hr-HR',
  'cs-CZ',
  'da-DK',
  'nl-NL',
  'en-AU',
  'en-GB',
  'en-IN',
  'en-IE',
  'en-NZ',
  'en-AB',
  'en-ZA',
  'en-US',
  'en-WL',
  'fa-IR',
  'fi-FI',
  'fr-FR',
  'fr-CA',
  'gl-ES',
  'de-DE',
  'de-CH',
  'el-GR',
  'he-IL',
  'hi-IN',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'lv-LV',
  'ms-MY',
  'no-NO',
  'pl-PL',
  'pt-PT',
  'pt-BR',
  'ro-RO',
  'ru-RU',
  'sr-RS',
  'sk-SK',
  'so-SO',
  'es-ES',
  'es-US',
  'sv-SE',
  'tl-PH',
  'th-TH',
  'uk-UA',
  'vi-VN',
  'zu-ZA',
] as const satisfies readonly CaptionsLanguageCode[];

export const captionsTranslationLanguageSchema = z.enum(CAPTIONS_TRANSLATION_LANGUAGES);

export type AdvancedSettingsCaptionsTranslationLanguage = z.infer<
  typeof captionsTranslationLanguageSchema
>;

export default captionsTranslationLanguageSchema;
