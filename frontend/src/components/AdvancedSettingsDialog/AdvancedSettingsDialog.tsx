import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import advancedSettings$ from '@Context/AdvancedSettings';
import VividIcon from '@ui/VividIcon';
import { AdvancedSettingsAudioTab } from './components/AdvancedSettingsAudioTab';
import { AdvancedSettingsGeneralTab } from './components/AdvancedSettingsGeneralTab';
import { AdvancedSettingsSidebar } from './components/AdvancedSettingsSidebar';
import { AdvancedSettingsStatisticsTab } from './components/AdvancedSettingsStatisticsTab';
import { AdvancedSettingsVideoTab } from './components/AdvancedSettingsVideoTab';

const AdvancedSettingsDialog = (): ReactElement => {
  const { t } = useTranslation();
  const isOpen = advancedSettings$.use.select(({ isOpen }) => isOpen);
  const selectedTab = advancedSettings$.use.select(({ selectedTab }) => selectedTab);

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
      slotProps={{
        paper: {
          className:
            'm-0 h-dvh max-h-dvh max-w-none overflow-hidden rounded-none bg-vera-surface sm:m-8 sm:h-[640px] sm:max-h-[640px] sm:rounded-vera-large md:max-w-3xl',
        },
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

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <AdvancedSettingsSidebar />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{tabContent}</div>
        </div>
      </div>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
