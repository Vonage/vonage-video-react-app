import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';

const tabs: { labelKey: string; icon: string; isSelected: boolean }[] = [
  { labelKey: 'advancedSettings.tabs.general', icon: 'gear-solid', isSelected: false },
  { labelKey: 'meetingFlow.meetingTab.tab', icon: 'clock-solid', isSelected: true },
  { labelKey: 'advancedSettings.tabs.video', icon: 'video-solid', isSelected: false },
  {
    labelKey: 'advancedSettings.tabs.screenSharing',
    icon: 'screen-share-solid',
    isSelected: false,
  },
  { labelKey: 'advancedSettings.tabs.audio', icon: 'microphone-solid', isSelected: false },
  {
    labelKey: 'advancedSettings.tabs.captions',
    icon: 'closed-captioning-solid',
    isSelected: false,
  },
  { labelKey: 'advancedSettings.tabs.statistics', icon: 'cell-reception-line', isSelected: false },
];

/**
 * The real Settings sidebar with a Meeting tab added after General and selected.
 */
const SettingsDialogMockupSidebar = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-55 md:flex-col md:gap-0.5 md:overflow-x-visible md:border-b-0 md:border-r">
      {tabs.map(({ labelKey, icon, isSelected }) => (
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
      ))}
    </div>
  );
};

export default SettingsDialogMockupSidebar;
