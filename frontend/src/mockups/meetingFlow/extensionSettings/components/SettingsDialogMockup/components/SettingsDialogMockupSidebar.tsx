import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';

export type SettingsDialogMockupSidebarProps = {
  hasMeetingTab: boolean;
};

const meetingTab = { labelKey: 'meetingFlow.meetingTab.tab', icon: 'clock-solid' };

const otherTabs = [
  { labelKey: 'advancedSettings.tabs.video', icon: 'video-solid' },
  { labelKey: 'advancedSettings.tabs.screenSharing', icon: 'screen-share-solid' },
  { labelKey: 'advancedSettings.tabs.audio', icon: 'microphone-solid' },
  { labelKey: 'advancedSettings.tabs.captions', icon: 'closed-captioning-solid' },
  { labelKey: 'advancedSettings.tabs.statistics', icon: 'cell-reception-line' },
];

/**
 * The real Settings sidebar. With `hasMeetingTab` a selected Meeting tab follows General; without it General is selected.
 */
const SettingsDialogMockupSidebar = ({
  hasMeetingTab,
}: SettingsDialogMockupSidebarProps): ReactElement => {
  const { t } = useTranslation();
  const generalTab = { labelKey: 'advancedSettings.tabs.general', icon: 'gear-solid' };
  const tabs = hasMeetingTab ? [generalTab, meetingTab, ...otherTabs] : [generalTab, ...otherTabs];
  const selectedLabelKey = hasMeetingTab ? meetingTab.labelKey : generalTab.labelKey;

  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-55 md:flex-col md:gap-0.5 md:overflow-x-visible md:border-b-0 md:border-r">
      {tabs.map(({ labelKey, icon }) => {
        const isSelected = labelKey === selectedLabelKey;

        return (
          <button
            key={labelKey}
            type="button"
            aria-current={isSelected}
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
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
};

export default SettingsDialogMockupSidebar;
