import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { Field } from '@ui/components';

const { setIncludeTranscriptionSummary } = advancedSettings$.actions;

const AdvancedSettingsGeneralTab = (): ReactElement => {
  const { t } = useTranslation();
  const includeTranscriptionSummary = advancedSettings$.use.select(
    ({ includeTranscriptionSummary }) => includeTranscriptionSummary
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('advancedSettings.tabs.general')}
      </h2>

      <Field>
        <Field.Label htmlFor="advanced-settings-general-include-transcription-summary">
          {t('advancedSettings.general.includeTranscriptionSummary.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-general-include-transcription-summary"
          checked={includeTranscriptionSummary}
          onChange={(event) => setIncludeTranscriptionSummary(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.general.includeTranscriptionSummary.description')}
        </Field.Description>
      </Field>

      <div>
        <button
          type="button"
          className="w-fit rounded-vera-medium bg-vera-primary px-4 py-2 font-vera-plain text-vera-body-base-semibold text-vera-surface transition-opacity hover:opacity-90"
        >
          {t('advancedSettings.general.resetButton')}
        </button>
        <p className="pt-2 font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('advancedSettings.general.resetDescription')}
        </p>
      </div>
    </div>
  );
};

export default AdvancedSettingsGeneralTab;
