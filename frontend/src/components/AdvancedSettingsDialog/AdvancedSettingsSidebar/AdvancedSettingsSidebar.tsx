import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import type { AdvancedSettingsTab } from '../types/types';

const tabs: AdvancedSettingsTab[] = ['general', 'video', 'audio', 'statistics'];

const AdvancedSettingsSidebar = (): ReactElement => {
  const { t } = useTranslation();
  const selectedTab = advancedSettingsDialog$.use.select((state) => state.selectedTab);
  const { setSelectedTab } = advancedSettingsDialog$.use.actions();

  return (
    <div className="flex h-full sm:w-45 md:w-55 w-25 flex-col gap-0.5 border-r border-vera-border bg-vera-background p-1">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={classNames(
              'rounded-xl px-4 py-3 text-left font-vera-plain text-vera-body-base-semibold transition-colors',
              {
                'bg-vera-surface text-vera-secondary': isSelected,
                'bg-transparent text-vera-tertiary hover:bg-vera-surface hover:text-vera-secondary':
                  !isSelected,
              }
            )}
          >
            {t(`advancedSettings.tabs.${tab}`)}
          </button>
        );
      })}
    </div>
  );
};

export default AdvancedSettingsSidebar;
