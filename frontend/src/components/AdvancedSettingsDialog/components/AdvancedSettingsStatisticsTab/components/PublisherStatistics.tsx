import { type ReactElement, useMemo } from 'react';
import { usePublisherStats } from '@core/hooks';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { AdvancedSettingsStatisticsGroup } from '../../AdvancedSettingsStatisticsGroup';
import { Publisher } from '@vonage/client-sdk-video';
import { BitrateValue, FrameRateValue, optionalValue, ResolutionValue } from '@core/metrics';

interface PublisherStatisticsProps {
  publisher: Publisher;
}

const PublisherStatistics = ({ publisher }: PublisherStatisticsProps): ReactElement => {
  const { t } = useTranslation();

  const publisherStatisticsEnabled = advancedSettings$.use.select(
    (state) => state.publisherStatisticsEnabled
  );

  const { data } = usePublisherStats({ publisher, publisherStatisticsEnabled });

  const publisherAudioStatistics = useMemo(() => {
    if (!data?.audio) {
      return [];
    }

    return [
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: data.audio.packetsSent.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: data.audio.packetsLost.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: data.audio.bytesSent.toString(),
      },
    ];
  }, [data, t]);

  const publisherVideoStatistics = useMemo(() => {
    if (!data?.video) {
      return [];
    }

    return [
      {
        label: t('advancedSettings.statistics.metrics.resolution'),
        value: data.resolution.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.frameRate'),
        value: data.frameRate.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.bitrate'),
        value: data.bitrateBps.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetLoss'),
        value: data.packetLossRatio.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: data.video.packetsSent.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: data.video.packetsLost.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: data.video.bytesSent.toString(),
      },
      {
        label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
        value: data.connectionEstimatedBandwidthBps.toString(),
      },
      ...(data.videoLayers ?? []).map((layer, index) => ({
        label: t('advancedSettings.statistics.metrics.videoLayer', {
          index: index + 1,
          codec: layer.codec,
        }),
        value: [
          optionalValue(
            ResolutionValue,
            { width: layer.width, height: layer.height },
            { fallback: '–' }
          ).toString(),
          optionalValue(FrameRateValue, layer.encodedFrameRate, { fallback: '–' }).toString(),
          optionalValue(BitrateValue, layer.bitrate, { fallback: '–' }).toString(),
          layer.qualityLimitationReason && layer.qualityLimitationReason !== 'none'
            ? layer.qualityLimitationReason
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
      })),
    ];
  }, [data, t]);

  return (
    <AdvancedSettingsStatisticsGroup
      title={t('advancedSettings.statistics.groups.publisher')}
      audioItems={publisherAudioStatistics}
      videoItems={publisherVideoStatistics}
      defaultExpanded
    />
  );
};

export default PublisherStatistics;
