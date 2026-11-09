import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { SelectField } from '@ui/components';
import type { SelectFieldOption } from '@ui/components/SelectField';
import {
  CAPTIONS_TRANSLATION_LANGUAGES,
  type AdvancedSettingsCaptionsTranslationLanguage,
} from '../../schemas';

const ORIGINAL_LANGUAGE_OPTION = 'original';

type CaptionsLanguageOptionValue =
  | AdvancedSettingsCaptionsTranslationLanguage
  | typeof ORIGINAL_LANGUAGE_OPTION;

const { setCaptionsTranslationLanguage } = advancedSettings$.actions;

const AdvancedSettingsCaptionsTab = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const captionsTranslationLanguage = advancedSettings$.use.select(
    ({ captionsTranslationLanguage }) => captionsTranslationLanguage
  );

  const languageOptions = useMemo(
    (): SelectFieldOption<CaptionsLanguageOptionValue>[] => [
      {
        value: ORIGINAL_LANGUAGE_OPTION,
        label: t('advancedSettings.captions.translationLanguage.options.original'),
      },
      ...getTranslationLanguageOptions(i18n.language),
    ],
    [t, i18n.language]
  );

  const handleLanguageChange = (value: CaptionsLanguageOptionValue) => {
    const isOriginalLanguage = value === ORIGINAL_LANGUAGE_OPTION;

    setCaptionsTranslationLanguage(isOriginalLanguage ? null : value);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('advancedSettings.tabs.captions')}
      </h2>

      <SelectField
        id="advanced-settings-captions-translation-language"
        data-testid="advanced-settings-captions-translation-language"
        label={t('advancedSettings.captions.translationLanguage.label')}
        value={captionsTranslationLanguage ?? ORIGINAL_LANGUAGE_OPTION}
        options={languageOptions}
        onChange={handleLanguageChange}
        description={t('advancedSettings.captions.translationLanguage.description')}
      />
    </div>
  );
};

function getTranslationLanguageOptions(
  displayLocale: string
): SelectFieldOption<AdvancedSettingsCaptionsTranslationLanguage>[] {
  const languageNames = new Intl.DisplayNames([displayLocale], { type: 'language' });

  return CAPTIONS_TRANSLATION_LANGUAGES.map((languageCode) => ({
    value: languageCode,
    label: languageNames.of(languageCode) ?? languageCode,
  })).sort((first, second) => first.label.localeCompare(second.label, displayLocale));
}

export default AdvancedSettingsCaptionsTab;
