import type { ReactElement } from 'react';
import { useSubscriberStats } from '@core/hooks';
import { useTranslation } from 'react-i18next';
import { AdvancedSettingsStatisticsGroup } from '../../AdvancedSettingsStatisticsGroup';
import { Subscriber } from '@vonage/client-sdk-video';

interface AdvancedSettingsStatisticsTabProps {
    subscriber: Subscriber;
}

const AdvancedSettingsStatisticsTab = ({
    subscriber,
}: AdvancedSettingsStatisticsTabProps): ReactElement => {
    const { t } = useTranslation();

    const { data } = useSubscriberStats({ subscriber });

    const subscriberStatisticsGroups = ((() => {
        if (!data) {
            return [];
        }

        return [
            id: subscriber.id,
            title: data?.title,
            audioItems: [
                {
                    label: t('advancedSettings.statistics.metrics.packetsReceived'),
                    value: subscriber.audio.packetsReceived.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
                    value: subscriber.audio.packetsLost.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.bytesReceived'),
                    value: subscriber.audio.bytesReceived.toString(),
                },
            ],
            videoItems: [
                {
                    label: t('advancedSettings.statistics.metrics.resolution'),
                    value: subscriber.video.resolution.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.codec'),
                    value: subscriber.video.codec ?? '–',
                },
                {
                    label: t('advancedSettings.statistics.metrics.frameRate'),
                    value: subscriber.video.frameRate.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.decodedFrameRate'),
                    value: subscriber.video.decodedFrameRate.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.bitrate'),
                    value: subscriber.video.bitrateBps.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.packetLoss'),
                    value: subscriber.packetLossRatio.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.freezeCount'),
                    value: subscriber.video.freezeCount.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.totalFreezesDuration'),
                    value: subscriber.video.totalFreezesDuration.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.packetsReceived'),
                    value: subscriber.video.packetsReceived.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
                    value: subscriber.video.packetsLost.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.bytesReceived'),
                    value: subscriber.video.bytesReceived.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
                    value: subscriber.connectionEstimatedBandwidthBps.toString(),
                },
                {
                    label: t('advancedSettings.statistics.metrics.remotePublisherEstimatedBandwidth'),
                    value: subscriber.remotePublisherConnectionEstimatedBandwidthBps.toString(),
                },
            ]
        ]
    })()

  return (
        <AdvancedSettingsStatisticsGroup
            key={subscriberStatisticsGroups.id}
            title={subscriberStatisticsGroups.title}
            audioItems={subscriberStatisticsGroups.audioItems}
            videoItems={subscriberStatisticsGroups.videoItems}
          />
    );
};

export default AdvancedSettingsStatisticsTab;
