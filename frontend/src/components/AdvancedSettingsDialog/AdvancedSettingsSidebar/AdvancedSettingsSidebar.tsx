import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { AdvancedSettingsTab } from '../types/types';

type AdvancedSettingsSidebarProps = {
  selectedTab: AdvancedSettingsTab;
  setSelectedTab: (tab: AdvancedSettingsTab) => void;
};

const tabs: AdvancedSettingsTab[] = ['general', 'video', 'audio', 'statistics'];

const AdvancedSettingsSidebar = ({
  selectedTab,
  setSelectedTab,
}: AdvancedSettingsSidebarProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full sm:w-45 md:w-55 w-25 flex-col gap-0.5 border-r border-vera-border bg-vera-background p-1">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setSelectedTab(tab);
            }}
            className={classNames(
              'rounded-xl px-4 py-3 text-left font-vera-plain text-vera-body-base-semibold transition-colors',
              isSelected
                ? 'bg-vera-surface text-vera-secondary'
                : 'bg-transparent text-vera-tertiary hover:bg-vera-surface hover:text-vera-secondary'
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
