import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import advancedSettings$ from '@Context/AdvancedSettings';
import { VividIcon } from '@ui';
import type { AdvancedSettingsTab } from '../../schemas';

const tabs: AdvancedSettingsTab[] = ['general', 'video', 'screenSharing', 'audio', 'statistics'];
const { setSelectedTab } = advancedSettings$.actions;

const AdvancedSettingsSidebar = (): ReactElement => {
  const { t } = useTranslation();
  const selectedTab = advancedSettings$.use.select((state) => state.selectedTab);

  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-55 md:flex-col md:gap-0.5 md:overflow-x-visible md:border-b-0 md:border-r">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab;
        const tabIcon = (() => {
          if (tab === 'video') return 'video-solid';
          if (tab === 'screenSharing') return 'screen-share-solid';
          if (tab === 'audio') return 'microphone-solid';
          if (tab === 'statistics') return 'cell-reception-line';
          return null;
        })();
        const tabIconTestId = (() => {
          if (tab === 'screenSharing') return 'advanced-settings-tab-screen-sharing-icon';
          if (tabIcon) return `advanced-settings-tab-${tab}-icon`;
          return null;
        })();

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
            {tabIcon && (
              <VividIcon data-testid={tabIconTestId ?? undefined} name={tabIcon} customSize={-5} />
            )}
            {t(`advancedSettings.tabs.${tab}`)}
          </button>
        );
      })}
    </div>
  );
};

export default AdvancedSettingsSidebar;
