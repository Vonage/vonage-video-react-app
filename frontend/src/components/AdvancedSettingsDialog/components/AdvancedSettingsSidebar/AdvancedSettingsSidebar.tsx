import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import advancedSettings$ from '@Context/AdvancedSettings';
import { VividIcon } from '@ui';
import type { AdvancedSettingsTab } from '../../types/types';

const tabs: AdvancedSettingsTab[] = ['general', 'video', 'screenSharing', 'audio', 'statistics'];
const { setSelectedTab } = advancedSettings$.actions;

const AdvancedSettingsSidebar = (): ReactElement => {
  const { t } = useTranslation();
  const selectedTab = advancedSettings$.use.select((state) => state.selectedTab);

  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-55 md:flex-col md:gap-0.5 md:overflow-x-visible md:border-b-0 md:border-r">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab;

        return (
          <button
            key={tab}
            type="button"
            data-testid={`advanced-settings-tab-${tab}`}
            onClick={() => setSelectedTab(tab)}
            className={classNames(
              'flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center font-vera-plain text-vera-body-base-semibold transition-colors md:justify-start md:text-left',
              {
                'bg-vera-surface text-vera-secondary': isSelected,
                'bg-transparent text-vera-tertiary hover:bg-vera-surface hover:text-vera-secondary':
                  !isSelected,
              }
            )}
          >
            {tab === 'video' && (
              <VividIcon
                data-testid="advanced-settings-tab-video-icon"
                name="video-solid"
                customSize={-5}
              />
            )}
            {tab === 'screenSharing' && (
              <VividIcon
                data-testid="advanced-settings-tab-screen-sharing-icon"
                name="screen-share-solid"
                customSize={-5}
              />
            )}
            {t(`advancedSettings.tabs.${tab}`)}
          </button>
        );
      })}
    </div>
  );
};

export default AdvancedSettingsSidebar;
