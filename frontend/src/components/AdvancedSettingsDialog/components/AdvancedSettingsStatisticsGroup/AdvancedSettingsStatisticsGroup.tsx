import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from '@ui/components';
import LabeledValueList from '@ui/LabeledValueList';
import type { IMetricValue } from '@core/metrics';
import type { Any } from '@common/types';

type AdvancedSettingsStatisticItem = {
  label: string;
  value: IMetricValue<Any> | string;
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

  const formattedAudioItems = useMemo(
    () =>
      audioItems.map(({ label, value }) => ({
        label,
        value: value.toString(),
      })),
    [audioItems]
  );

  const formattedVideoItems = useMemo(
    () =>
      videoItems.map(({ label, value }) => ({
        label,
        value: value.toString(),
      })),
    [videoItems]
  );

  return (
    <Collapsible
      open={defaultExpanded}
      className="rounded-vera-medium border border-vera-border bg-vera-background flex flex-col p-3"
    >
      <Collapsible.Summary className="justify-between">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {title}
        </span>

        <Collapsible.Icon customSize={-5} style={{ color: 'var(--vera-text-tertiary)' }} />
      </Collapsible.Summary>

      <Collapsible.Details className="border-t border-vera-border flex flex-col gap-3 pt-3">
        {hasStatistics && (
          <div className="flex flex-col gap-6">
            {audioItems.length > 0 && (
              <LabeledValueList
                title={t('advancedSettings.statistics.sections.audio')}
                items={formattedAudioItems}
              />
            )}

            {videoItems.length > 0 && (
              <LabeledValueList
                title={t('advancedSettings.statistics.sections.video')}
                items={formattedVideoItems}
              />
            )}
          </div>
        )}

        {!hasStatistics && (
          <p className="font-vera-plain text-vera-body-base text-vera-tertiary">
            {t('advancedSettings.statistics.empty')}
          </p>
        )}
      </Collapsible.Details>
    </Collapsible>
  );
};

export default AdvancedSettingsStatisticsGroup;
