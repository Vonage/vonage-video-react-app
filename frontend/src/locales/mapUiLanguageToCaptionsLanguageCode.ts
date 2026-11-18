import type { CaptionsLanguageCode } from '@vonage/client-sdk-video';
import { Lang } from '@common/schemas';

const CAPTIONS_LANGUAGE_CODES: Record<Lang, CaptionsLanguageCode> = {
  [Lang.EN]: 'en-US',
  [Lang.EN_US]: 'en-US',
  [Lang.DE]: 'de-DE',
  [Lang.ES]: 'es-ES',
  [Lang.ES_MX]: 'es-US',
  [Lang.IT]: 'it-IT',
  [Lang.JA]: 'ja-JP',
};

function mapUiLanguageToCaptionsLanguageCode(language: string): CaptionsLanguageCode {
  return CAPTIONS_LANGUAGE_CODES[language as Lang] ?? 'en-US';
}

export default mapUiLanguageToCaptionsLanguageCode;
