import type { ReactElement } from 'react';
import CollapsibleSection from '@ui/CollapsibleSection';
import LabeledValueList from '@ui/LabeledValueList';

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
  const hasStatistics = audioItems.length > 0 || videoItems.length > 0;

  return (
    <CollapsibleSection title={title} defaultExpanded={defaultExpanded}>
      {hasStatistics ? (
        <div className="flex flex-col gap-6">
          {audioItems.length > 0 && <LabeledValueList title={audioTitle} items={audioItems} />}
          {videoItems.length > 0 && <LabeledValueList title={videoTitle} items={videoItems} />}
        </div>
      ) : (
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">{emptyLabel}</p>
      )}
    </CollapsibleSection>
  );
};

export default AdvancedSettingsStatisticsGroup;
