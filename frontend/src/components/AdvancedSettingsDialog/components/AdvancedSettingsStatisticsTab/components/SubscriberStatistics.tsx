import { useMemo, type ReactElement } from 'react';
import { useSubscriberStats } from '@core/hooks';
import { useTranslation } from 'react-i18next';
import { AdvancedSettingsStatisticsGroup } from '../../AdvancedSettingsStatisticsGroup';
import { Subscriber } from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';

interface SubscriberStatisticsProps {
  subscriber: Subscriber;
  subscriberId: string;
}

const SubscriberStatistics = ({ subscriber, subscriberId }: SubscriberStatisticsProps): ReactElement => {
  const { t } = useTranslation();

  const { data } = useSubscriberStats({ subscriber, subscriberId });

  const publisherAudioFallbackEnabled = advancedSettings$.use.select(
    ({ publisherAudioFallbackEnabled }) => publisherAudioFallbackEnabled
  );
  const subscriberAudioFallbackEnabled = advancedSettings$.use.select(
    ({ subscriberAudioFallbackEnabled }) => subscriberAudioFallbackEnabled
  );

  const isNetworkConditionAvailable =
    publisherAudioFallbackEnabled && subscriberAudioFallbackEnabled;

  const subscriberStatisticsGroups = useMemo(() => {
    if (!data) {
      return {
        id: 'no-stats',
        title: '...',
        audioItems: [],
        videoItems: [],
        networkItems: [],
      };
    }

    return {
      id: data.id,
      title: data?.title,
      audioItems: [
        {
          label: t('advancedSettings.statistics.metrics.packetsReceived'),
          value: data.audio.packetsReceived,
        },
        {
          label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
          value: data.audio.packetsLost,
        },
        {
          label: t('advancedSettings.statistics.metrics.bytesReceived'),
          value: data.audio.bytesReceived,
        },
      ],
      videoItems: [
        {
          label: t('advancedSettings.statistics.metrics.resolution'),
          value: data.video.resolution,
        },
        {
          label: t('advancedSettings.statistics.metrics.codec'),
          value: data.video.codec ?? '–',
        },
        {
          label: t('advancedSettings.statistics.metrics.frameRate'),
          value: data.video.frameRate,
        },
        {
          label: t('advancedSettings.statistics.metrics.decodedFrameRate'),
          value: data.video.decodedFrameRate,
        },
        {
          label: t('advancedSettings.statistics.metrics.bitrate'),
          value: data.video.bitrateBps,
        },
        {
          label: t('advancedSettings.statistics.metrics.packetLoss'),
          value: data.packetLossRatio,
        },
        {
          label: t('advancedSettings.statistics.metrics.freezeCount'),
          value: data.video.freezeCount,
        },
        {
          label: t('advancedSettings.statistics.metrics.totalFreezesDuration'),
          value: data.video.totalFreezesDuration,
        },
        {
          label: t('advancedSettings.statistics.metrics.packetsReceived'),
          value: data.video.packetsReceived,
        },
        {
          label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
          value: data.video.packetsLost,
        },
        {
          label: t('advancedSettings.statistics.metrics.bytesReceived'),
          value: data.video.bytesReceived,
        },
        {
          label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
          value: data.connectionEstimatedBandwidthBps,
        },
        {
          label: t('advancedSettings.statistics.metrics.remotePublisherEstimatedBandwidth'),
          value: data.remotePublisherConnectionEstimatedBandwidthBps,
        },
      ],
      networkItems: isNetworkConditionAvailable
        ? [
            {
              label: t('advancedSettings.statistics.metrics.networkCondition'),
              value: data.network.score,
            },
            {
              label: t('advancedSettings.statistics.metrics.networkConditionReason'),
              value: data.network.reason,
            },
          ]
        : [],
    };
  }, [data, t, isNetworkConditionAvailable]);

  const networkDisabledMessage = isNetworkConditionAvailable
    ? undefined
    : t('advancedSettings.statistics.sections.networkDisabled');

  return (
    <AdvancedSettingsStatisticsGroup
      key={subscriberStatisticsGroups.id}
      title={subscriberStatisticsGroups.title ?? '...'}
      audioItems={subscriberStatisticsGroups.audioItems}
      videoItems={subscriberStatisticsGroups.videoItems}
      networkItems={subscriberStatisticsGroups.networkItems}
      networkDisabledMessage={networkDisabledMessage}
    />
  );
};

export default SubscriberStatistics;
