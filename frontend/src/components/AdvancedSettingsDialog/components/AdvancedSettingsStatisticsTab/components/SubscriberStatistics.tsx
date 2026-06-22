import { useMemo, type ReactElement } from 'react';
import { useSubscriberStats } from '@core/hooks';
import { useTranslation } from 'react-i18next';
import { AdvancedSettingsStatisticsGroup } from '../../AdvancedSettingsStatisticsGroup';
import { Subscriber } from '@vonage/client-sdk-video';

interface SubscriberStatisticsProps {
  subscriber: Subscriber;
}

const SubscriberStatistics = ({ subscriber }: SubscriberStatisticsProps): ReactElement => {
  const { t } = useTranslation();

  const { data } = useSubscriberStats({ subscriber });

  const subscriberStatisticsGroups = useMemo(() => {
    if (!data) {
      return {
        id: 'no-stats',
        title: '...',
        audioItems: [],
        videoItems: [],
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
    };
  }, [data, t]);

  return (
    <AdvancedSettingsStatisticsGroup
      key={subscriberStatisticsGroups.id}
      title={subscriberStatisticsGroups.title ?? '...'}
      audioItems={subscriberStatisticsGroups.audioItems}
      videoItems={subscriberStatisticsGroups.videoItems}
    />
  );
};

export default SubscriberStatistics;
