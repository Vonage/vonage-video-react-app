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

const optionalValueArgs = { fallback: '–' };

const PublisherStatistics = ({ publisher }: PublisherStatisticsProps): ReactElement => {
  const { t } = useTranslation();

  const publisherStatisticsEnabled = advancedSettings$.use.select(
    (state) => state.publisherStatisticsEnabled
  );
  const fixedFrameRate = advancedSettings$.use.select((state) => state.frameRate);

  const { data } = usePublisherStats({
    publisher,
    publisherStatisticsEnabled,
    fixedFrameRate: fixedFrameRate ?? null,
  });

  const publisherAudioStatistics = useMemo(() => {
    if (!data?.audio) {
      return [];
    }

    return [
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: data.audio.packetsSent,
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: data.audio.packetsLost,
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: data.audio.bytesSent,
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
        value: data.resolution,
      },
      {
        label: t('advancedSettings.statistics.metrics.frameRate'),
        value: data.frameRate,
      },
      {
        label: t('advancedSettings.statistics.metrics.bitrate'),
        value: data.bitrateBps,
      },
      {
        label: t('advancedSettings.statistics.metrics.packetLoss'),
        value: data.packetLossRatio,
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: data.video.packetsSent,
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: data.video.packetsLost,
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: data.video.bytesSent,
      },
      {
        label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
        value: data.connectionEstimatedBandwidthBps,
      },

      ...(data.videoLayers ?? []).map((layer, index) => ({
        label: t('advancedSettings.statistics.metrics.videoLayer', {
          index: index + 1,
          codec: layer.codec,
        }),

        value: [
          optionalValue(ResolutionValue, layer, optionalValueArgs),
          optionalValue(FrameRateValue, layer.encodedFrameRate, optionalValueArgs),
          optionalValue(BitrateValue, layer.bitrate, optionalValueArgs),
          layer.qualityLimitationReason !== 'none' ? layer.qualityLimitationReason : null,
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
