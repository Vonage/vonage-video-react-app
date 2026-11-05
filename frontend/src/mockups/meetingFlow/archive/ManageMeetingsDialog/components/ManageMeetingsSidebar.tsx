import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import manageMeetingsDialog$, {
  type ManageMeetingsTab,
} from '../context/manageMeetingsDialogContext';

const tabs: { tab: ManageMeetingsTab; icon: string }[] = [
  { tab: 'upcoming', icon: 'calendar-line' },
  { tab: 'archived', icon: 'inbox-line' },
  { tab: 'backup', icon: 'export-line' },
];

/**
 * Sidebar of the Manage meetings dialog, styled like the Advanced settings sidebar.
 */
const ManageMeetingsSidebar = (): ReactElement => {
  const { t } = useTranslation();
  const selectedTab = manageMeetingsDialog$.use.select((state) => state.selectedTab);
  const { selectTab } = manageMeetingsDialog$.use.actions();

  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-55 md:flex-col md:gap-0.5 md:overflow-x-visible md:border-b-0 md:border-r">
      {tabs.map(({ tab, icon }) => {
        const isSelected = selectedTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => selectTab(tab)}
            className={classNames(
              'flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center font-vera-plain text-vera-body-base-semibold transition-colors md:justify-start md:text-left',
              {
                'bg-vera-surface text-vera-text-secondary': isSelected,
                'bg-transparent text-vera-text-tertiary hover:bg-vera-surface hover:text-vera-text-secondary':
                  !isSelected,
              }
            )}
          >
            <VividIcon name={icon} customSize={-5} />
            {t(`meetingFlow.archive.tabs.${tab}`)}
          </button>
        );
      })}
    </div>
  );
};

export default ManageMeetingsSidebar;
