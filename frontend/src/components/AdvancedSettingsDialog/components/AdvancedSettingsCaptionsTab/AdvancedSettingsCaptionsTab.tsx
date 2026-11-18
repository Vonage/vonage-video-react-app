import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { SelectField } from '@ui/components';
import type { SelectFieldOption } from '@ui/components/SelectField';
import {
  CAPTIONS_INPUT_LANGUAGES,
  CAPTIONS_TRANSLATION_LANGUAGES,
  type AdvancedSettingsCaptionsInputLanguage,
  type AdvancedSettingsCaptionsTranslationLanguage,
} from '../../schemas';

const ORIGINAL_LANGUAGE_OPTION = 'original';
const FOLLOW_UI_LANGUAGE_OPTION = 'followUi';

type CaptionsLanguageOptionValue =
  | AdvancedSettingsCaptionsTranslationLanguage
  | typeof ORIGINAL_LANGUAGE_OPTION;

type CaptionsInputLanguageOptionValue =
  | AdvancedSettingsCaptionsInputLanguage
  | typeof FOLLOW_UI_LANGUAGE_OPTION;

const { setCaptionsInputLanguage, setCaptionsTranslationLanguage } = advancedSettings$.actions;

const AdvancedSettingsCaptionsTab = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const captionsTranslationLanguage = advancedSettings$.use.select(
    ({ captionsTranslationLanguage }) => captionsTranslationLanguage
  );
  const captionsInputLanguage = advancedSettings$.use.select(
    ({ captionsInputLanguage }) => captionsInputLanguage
  );

  const inputLanguageOptions = useMemo(
    (): SelectFieldOption<CaptionsInputLanguageOptionValue>[] => [
      {
        value: FOLLOW_UI_LANGUAGE_OPTION,
        label: t('advancedSettings.captions.inputLanguage.options.followUi'),
      },
      ...getInputLanguageOptions(i18n.language),
    ],
    [t, i18n.language]
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

  const handleInputLanguageChange = (value: CaptionsInputLanguageOptionValue) => {
    setCaptionsInputLanguage(value === FOLLOW_UI_LANGUAGE_OPTION ? null : value);
  };

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
        id="advanced-settings-captions-input-language"
        data-testid="advanced-settings-captions-input-language"
        label={t('advancedSettings.captions.inputLanguage.label')}
        value={captionsInputLanguage ?? FOLLOW_UI_LANGUAGE_OPTION}
        options={inputLanguageOptions}
        onChange={handleInputLanguageChange}
        description={t('advancedSettings.captions.inputLanguage.description')}
      />

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

function getInputLanguageOptions(
  displayLocale: string
): SelectFieldOption<AdvancedSettingsCaptionsInputLanguage>[] {
  const languageNames = new Intl.DisplayNames([displayLocale], { type: 'language' });

  return CAPTIONS_INPUT_LANGUAGES.map((languageCode) => ({
    value: languageCode,
    label: languageNames.of(languageCode) ?? languageCode,
  })).sort((first, second) => first.label.localeCompare(second.label, displayLocale));
}

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
