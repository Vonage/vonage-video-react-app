import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const AdvancedSettingsGeneralTab = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.general')}
      </h2>
      <div>
        <button
          type="button"
          className="w-fit rounded-vera-medium bg-vera-primary px-4 py-2 font-vera-plain text-vera-body-base-semibold text-vera-surface transition-opacity hover:opacity-90"
        >
          {t('advancedSettings.general.resetButton')}
        </button>
        <p className="pt-2 font-vera-plain text-vera-body-base text-vera-tertiary">
          {t('advancedSettings.general.resetDescription')}
        </p>
      </div>
    </div>
  );
};

export default AdvancedSettingsGeneralTab;
