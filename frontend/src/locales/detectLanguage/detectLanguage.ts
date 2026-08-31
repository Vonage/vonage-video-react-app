import { isNil } from '@common/assertions';
import { env } from '../../env';
import type { Lang } from '@common/schemas';

/**
 * Resolves a BCP-47 language tag (e.g. "es-ES", "it-CH") to the closest
 * supported Lang value. Falls back to the configured fallback language.
 */
function detectLanguage(): Lang {
  if (isNil(globalThis.navigator?.language)) return env.I18N_FALLBACK_LANGUAGE;

  const supported = env.I18N_SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      const normalized = lang.toLowerCase();
      const base = normalized.split('-')[0];
      acc[normalized] = lang;
      acc[base] ??= lang;
      return acc;
    },
    {} as Record<string, Lang>
  );

  const userLang = globalThis.navigator.language.toLowerCase();
  const match = supported[userLang] ?? supported[userLang.split('-')[0]];
  if (match) return match;

  const browserLanguages = globalThis.navigator.languages ?? [];

  for (const tag of browserLanguages) {
    const normalized = tag.toLowerCase();
    const match = supported[normalized] ?? supported[normalized.split('-')[0]];
    if (match) return match;
  }

  return env.I18N_FALLBACK_LANGUAGE;
}

export default detectLanguage;
