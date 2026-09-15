import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { SelectField } from '@ui';
import type {
  AdvancedSettingsScreenShareSurface,
  AdvancedSettingsSelectOption,
} from '../../types/types';
import { ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE } from '../../types/types';

const { setScreenShareSurface } = advancedSettings$.actions;

const AdvancedSettingsGeneralTab = (): ReactElement => {
  const { t } = useTranslation();
  const screenShareSurface = advancedSettings$.use.select(
    ({ screenShareSurface }) => screenShareSurface
  );

  const screenShareSurfaceOptions: AdvancedSettingsSelectOption<AdvancedSettingsScreenShareSurface>[] =
    (
      Object.values(ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE) as AdvancedSettingsScreenShareSurface[]
    ).map((surface) => ({
      value: surface,
      label: t(`advancedSettings.general.screenShareSurface.options.${surface}`),
    }));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.general')}
      </h2>

      <SelectField
        id="advanced-settings-general-screen-share-surface"
        label={t('advancedSettings.general.screenShareSurface.label')}
        value={screenShareSurface}
        options={screenShareSurfaceOptions}
        onChange={setScreenShareSurface}
      />

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
