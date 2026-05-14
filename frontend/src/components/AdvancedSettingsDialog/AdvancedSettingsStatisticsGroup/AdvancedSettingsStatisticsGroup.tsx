import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import CollapsibleSection from '@ui/CollapsibleSection';
import LabeledValueList from '@ui/LabeledValueList';

type AdvancedSettingsStatisticItem = {
  label: string;
  value: string;
};

type AdvancedSettingsStatisticsGroupProps = {
  title: string;
  audioItems: AdvancedSettingsStatisticItem[];
  videoItems: AdvancedSettingsStatisticItem[];
  defaultExpanded?: boolean;
};

const AdvancedSettingsStatisticsGroup = ({
  title,
  audioItems,
  videoItems,
  defaultExpanded = false,
}: AdvancedSettingsStatisticsGroupProps): ReactElement => {
  const { t } = useTranslation();
  const hasStatistics = audioItems.length > 0 || videoItems.length > 0;

  return (
    <CollapsibleSection title={title} defaultExpanded={defaultExpanded}>
      {hasStatistics ? (
        <div className="flex flex-col gap-6">
          {audioItems.length > 0 && (
            <LabeledValueList
              title={t('advancedSettings.statistics.sections.audio')}
              items={audioItems}
            />
          )}
          {videoItems.length > 0 && (
            <LabeledValueList
              title={t('advancedSettings.statistics.sections.video')}
              items={videoItems}
            />
          )}
        </div>
      ) : (
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">
          {t('advancedSettings.statistics.empty')}
        </p>
      )}
    </CollapsibleSection>
  );
};

export default AdvancedSettingsStatisticsGroup;
