import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useSessionContext from '@hooks/useSessionContext';
import SwitchField from '@ui/SwitchField';
import { AdvancedSettingsStatisticsGroup } from '../AdvancedSettingsStatisticsGroup';
import {
  formatBitrate,
  formatBytes,
  formatDuration,
  formatFrameRate,
  formatInteger,
  formatOptionalInteger,
  formatPacketLoss,
  formatResolution,
} from './formatters';
import useStatisticsInspectorData from './useStatisticsInspectorData';

const { setPublisherStatisticsEnabled } = advancedSettings$.actions;

const AdvancedSettingsStatisticsTab = (): ReactElement => {
  const { t } = useTranslation();
  const { publisher: meetingPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const { subscriberWrappers } = useSessionContext();

  const publisherStatisticsEnabled = advancedSettings$.use.select(
    (state) => state.publisherStatisticsEnabled
  );

  const { publisher, subscribers } = useStatisticsInspectorData({
    meetingPublisher,
    previewPublisher,
    subscriberWrappers,
    publisherStatisticsEnabled,
  });

  const publisherAudioStatistics = (() => {
    if (!publisher?.audio) {
      return [];
    }

    return [
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: formatInteger(publisher.audio.packetsSent),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: formatInteger(publisher.audio.packetsLost),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: formatBytes(publisher.audio.bytesSent),
      },
    ];
  })();

  const publisherVideoStatistics = (() => {
    if (!publisher?.video) {
      return [];
    }

    return [
      {
        label: t('advancedSettings.statistics.metrics.resolution'),
        value: formatResolution(publisher.resolution),
      },
      {
        label: t('advancedSettings.statistics.metrics.frameRate'),
        value: formatFrameRate(publisher.frameRate),
      },
      {
        label: t('advancedSettings.statistics.metrics.bitrate'),
        value: formatBitrate(publisher.bitrateBps),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetLoss'),
        value: formatPacketLoss(publisher.packetLossRatio),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsSent'),
        value: formatInteger(publisher.video.packetsSent),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostSent'),
        value: formatInteger(publisher.video.packetsLost),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesSent'),
        value: formatBytes(publisher.video.bytesSent),
      },
      {
        label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
        value: formatBitrate(publisher.connectionEstimatedBandwidthBps),
      },
      ...(publisher.videoLayers ?? []).map((layer, index) => ({
        label: t('advancedSettings.statistics.metrics.videoLayer', {
          index: index + 1,
          codec: layer.codec,
        }),
        value: [
          formatResolution({ width: layer.width, height: layer.height }),
          formatFrameRate(layer.encodedFrameRate),
          formatBitrate(layer.bitrate),
          layer.qualityLimitationReason && layer.qualityLimitationReason !== 'none'
            ? layer.qualityLimitationReason
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
      })),
    ];
  })();

  const subscriberStatisticsGroups = subscribers.map((subscriber, index) => ({
    id: subscriber.id,
    title:
      subscriber.title ||
      t('advancedSettings.statistics.groups.subscriber', {
        index: index + 1,
      }),
    audioItems: [
      {
        label: t('advancedSettings.statistics.metrics.packetsReceived'),
        value: formatInteger(subscriber.audio.packetsReceived),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
        value: formatInteger(subscriber.audio.packetsLost),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesReceived'),
        value: formatBytes(subscriber.audio.bytesReceived),
      },
    ],
    videoItems: [
      {
        label: t('advancedSettings.statistics.metrics.resolution'),
        value: formatResolution({ width: subscriber.video.width, height: subscriber.video.height }),
      },
      {
        label: t('advancedSettings.statistics.metrics.codec'),
        value: subscriber.video.codec ?? '–',
      },
      {
        label: t('advancedSettings.statistics.metrics.frameRate'),
        value: formatFrameRate(subscriber.video.frameRate),
      },
      {
        label: t('advancedSettings.statistics.metrics.decodedFrameRate'),
        value: formatFrameRate(subscriber.video.decodedFrameRate),
      },
      {
        label: t('advancedSettings.statistics.metrics.bitrate'),
        value: formatBitrate(subscriber.video.bitrateBps),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetLoss'),
        value: formatPacketLoss(subscriber.packetLossRatio),
      },
      {
        label: t('advancedSettings.statistics.metrics.freezeCount'),
        value: formatOptionalInteger(subscriber.video.freezeCount),
      },
      {
        label: t('advancedSettings.statistics.metrics.totalFreezesDuration'),
        value: formatDuration(subscriber.video.totalFreezesDuration),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsReceived'),
        value: formatInteger(subscriber.video.packetsReceived),
      },
      {
        label: t('advancedSettings.statistics.metrics.packetsLostReceived'),
        value: formatInteger(subscriber.video.packetsLost),
      },
      {
        label: t('advancedSettings.statistics.metrics.bytesReceived'),
        value: formatBytes(subscriber.video.bytesReceived),
      },
      {
        label: t('advancedSettings.statistics.metrics.estimatedBandwidth'),
        value: formatBitrate(subscriber.connectionEstimatedBandwidthBps),
      },
      {
        label: t('advancedSettings.statistics.metrics.remotePublisherEstimatedBandwidth'),
        value: formatBitrate(subscriber.remotePublisherConnectionEstimatedBandwidthBps),
      },
    ],
  }));

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.statistics')}
      </h2>
      <SwitchField
        id="advanced-settings-statistics-enable-publisher"
        label={t('advancedSettings.statistics.collection.enablePublisher.label')}
        checked={publisherStatisticsEnabled}
        onChange={setPublisherStatisticsEnabled}
        description={t('advancedSettings.statistics.collection.enablePublisher.description')}
      />

      <div className="flex flex-col gap-4">
        <AdvancedSettingsStatisticsGroup
          title={t('advancedSettings.statistics.groups.publisher')}
          audioItems={publisherAudioStatistics}
          videoItems={publisherVideoStatistics}
          defaultExpanded
        />

        {subscriberStatisticsGroups.map((subscriberStatisticsGroup) => (
          <AdvancedSettingsStatisticsGroup
            key={subscriberStatisticsGroup.id}
            title={subscriberStatisticsGroup.title}
            audioItems={subscriberStatisticsGroup.audioItems}
            videoItems={subscriberStatisticsGroup.videoItems}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettingsStatisticsTab;
