import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import advancedSettings$ from '@Context/AdvancedSettings';
import VividIcon from '@ui/VividIcon';
import { AdvancedSettingsAudioTab } from './AdvancedSettingsAudioTab';
import { AdvancedSettingsGeneralTab } from './AdvancedSettingsGeneralTab';
import { AdvancedSettingsSidebar } from './AdvancedSettingsSidebar';
import { AdvancedSettingsStatisticsTab } from './AdvancedSettingsStatisticsTab';
import { AdvancedSettingsVideoTab } from './AdvancedSettingsVideoTab';

const AdvancedSettingsDialog = (): ReactElement => {
  const { t } = useTranslation();
  const { isOpen, selectedTab } = advancedSettings$.use.select((state) => ({
    isOpen: state.isOpen,
    selectedTab: state.selectedTab,
  }));

  const tabContent = (() => {
    if (selectedTab === 'general') return <AdvancedSettingsGeneralTab />;
    if (selectedTab === 'video') return <AdvancedSettingsVideoTab />;
    if (selectedTab === 'audio') return <AdvancedSettingsAudioTab />;
    return <AdvancedSettingsStatisticsTab />;
  })();

  return (
    <Dialog
      open={isOpen}
      onClose={advancedSettings$.actions.close}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'h-[640px] max-h-[640px] overflow-hidden rounded-vera-large bg-vera-surface',
      }}
      data-testid="advanced-settings-dialog"
    >
      <div className="flex h-full flex-col bg-vera-surface">
        <div className="relative border-b border-vera-border bg-vera-surface px-6 pb-4 pt-6">
          <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
            {t('advancedSettings.title')}
          </h2>
          <button
            type="button"
            aria-label={t('button.close')}
            onClick={advancedSettings$.actions.close}
            className={classNames(
              'cursor-pointer absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full',
              'text-vera-secondary transition-colors hover:bg-vera-background'
            )}
          >
            <VividIcon name="close-line" customSize={-5} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <AdvancedSettingsSidebar />

          <div className="flex-1 overflow-y-auto p-6">{tabContent}</div>
        </div>
      </div>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
