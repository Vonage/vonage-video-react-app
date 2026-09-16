import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from '@ui/components';
import type { IMetricValue } from '@core/metrics';
import type { Any } from '@common/types';
import LabeledValueList from '../LabeledValueList';

type AdvancedSettingsStatisticItem = {
  label: string;
  value: IMetricValue<Any> | string;
};

type AdvancedSettingsStatisticsGroupProps = {
  title: string;
  audioItems: AdvancedSettingsStatisticItem[];
  videoItems: AdvancedSettingsStatisticItem[];
  networkItems: AdvancedSettingsStatisticItem[];
  networkDisabledMessage?: string;
  defaultExpanded?: boolean;
};

const AdvancedSettingsStatisticsGroup = ({
  title,
  audioItems,
  videoItems,
  networkItems,
  networkDisabledMessage,
  defaultExpanded = false,
}: AdvancedSettingsStatisticsGroupProps): ReactElement => {
  const { t } = useTranslation();
  const hasStatistics =
    audioItems.length > 0 ||
    videoItems.length > 0 ||
    networkItems.length > 0 ||
    !!networkDisabledMessage;

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

  const formattedNetworkItems = useMemo(
    () =>
      networkItems.map(({ label, value }) => ({
        label,
        value: value.toString(),
      })),
    [networkItems]
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

            {networkItems.length > 0 && (
              <LabeledValueList
                title={t('advancedSettings.statistics.sections.network')}
                items={formattedNetworkItems}
              />
            )}

            {networkDisabledMessage && (
              <div className="flex flex-col gap-2">
                <span className="font-vera-plain text-vera-body-base-semibold text-vera-secondary">
                  {t('advancedSettings.statistics.sections.network')}
                </span>
                <p className="rounded-vera-medium border border-vera-warning bg-vera-warning/10 px-3 py-2 font-vera-plain text-vera-caption text-vera-warning">
                  {networkDisabledMessage}
                </p>
              </div>
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
