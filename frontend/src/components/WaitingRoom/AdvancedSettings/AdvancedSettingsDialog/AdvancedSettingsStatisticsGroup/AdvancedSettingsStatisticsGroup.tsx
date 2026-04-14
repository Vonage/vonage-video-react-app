import { useState } from 'react';
import type { ReactElement } from 'react';
import VividIcon from '@components/VividIcon';
import AdvancedSettingsStatisticsList from '../AdvancedSettingsStatisticsList';

type AdvancedSettingsStatisticItem = {
  label: string;
  value: string;
};

type AdvancedSettingsStatisticsGroupProps = {
  title: string;
  audioTitle: string;
  videoTitle: string;
  audioItems: AdvancedSettingsStatisticItem[];
  videoItems: AdvancedSettingsStatisticItem[];
  emptyLabel: string;
  defaultExpanded?: boolean;
};

const AdvancedSettingsStatisticsGroup = ({
  title,
  audioTitle,
  videoTitle,
  audioItems,
  videoItems,
  emptyLabel,
  defaultExpanded = false,
}: AdvancedSettingsStatisticsGroupProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasStatistics = audioItems.length > 0 || videoItems.length > 0;

  return (
    <div className="rounded-vera-medium border border-vera-border bg-vera-background">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isExpanded}
        onClick={() => {
          setIsExpanded((currentIsExpanded) => !currentIsExpanded);
        }}
      >
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {title}
        </span>

        <VividIcon
          name={isExpanded ? 'chevron-up-line' : 'chevron-down-line'}
          customSize={-5}
          className="text-vera-tertiary"
        />
      </button>

      {isExpanded && (
        <div className="border-t border-vera-border px-4 py-4">
          {hasStatistics ? (
            <div className="flex flex-col gap-6">
              {audioItems.length > 0 && (
                <AdvancedSettingsStatisticsList title={audioTitle} items={audioItems} />
              )}
              {videoItems.length > 0 && (
                <AdvancedSettingsStatisticsList title={videoTitle} items={videoItems} />
              )}
            </div>
          ) : (
            <p className="font-vera-plain text-vera-body-base text-vera-tertiary">{emptyLabel}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSettingsStatisticsGroup;
