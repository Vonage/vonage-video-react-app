import { useEffect } from 'react';
import type { Subscriber } from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';
import { isNil } from '@common/assertions';
import frontendLogger from '../../../../../../logger';

const useCaptionsTranslation = (subscriber: Subscriber | null): void => {
  const captionsTranslationLanguage = advancedSettings$.use.select(
    ({ captionsTranslationLanguage }) => captionsTranslationLanguage
  );

  useEffect(() => {
    if (isNil(subscriber)) return;

    const isLanguageAlreadyApplied =
      subscriber.getCaptionsTranslationLanguage() === captionsTranslationLanguage;

    if (isLanguageAlreadyApplied) return;

    subscriber.setCaptionsTranslationLanguage(captionsTranslationLanguage).catch((error) => {
      frontendLogger.reportError(error, {
        eventSource: 'useCaptionsTranslation.setCaptionsTranslationLanguage',
        streamId: subscriber.stream?.streamId,
        captionsTranslationLanguage,
      });
    });
  }, [subscriber, captionsTranslationLanguage]);
};

export default useCaptionsTranslation;
