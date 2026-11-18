import { useEffect } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import mapUiLanguageToCaptionsLanguageCode from '@locales/mapUiLanguageToCaptionsLanguageCode';
import appI18n from '../../../../../i18n';
import frontendLogger from '../../../../../logger';

const useCaptionsInputLanguage = (publisher: Publisher | null): void => {
  const { i18n } = useTranslation();
  const captionsInputLanguage = advancedSettings$.use.select(
    ({ captionsInputLanguage }) => captionsInputLanguage
  );
  const uiLanguage = i18n?.language ?? appI18n.language;
  const languageCode = captionsInputLanguage ?? mapUiLanguageToCaptionsLanguageCode(uiLanguage);

  useEffect(() => {
    if (!publisher) return;

    const isLanguageAlreadyApplied = publisher.getCaptionsInputLanguage() === languageCode;

    if (isLanguageAlreadyApplied) return;

    publisher.setCaptionsInputLanguage(languageCode).catch((error) => {
      frontendLogger.reportError(error, {
        eventSource: 'useCaptionsInputLanguage.setCaptionsInputLanguage',
        streamId: publisher.stream?.streamId,
        captionsInputLanguage: languageCode,
      });
    });
  }, [publisher, languageCode]);
};

export default useCaptionsInputLanguage;
