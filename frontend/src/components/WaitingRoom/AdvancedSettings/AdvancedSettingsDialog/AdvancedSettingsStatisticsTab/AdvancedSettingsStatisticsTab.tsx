import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedSettingsBooleanField from '../AdvancedSettingsBooleanField';
import AdvancedSettingsStatisticsList from '../AdvancedSettingsStatisticsList';

type AdvancedSettingsStatisticsTabProps = {
  publisherStatisticsEnabled: boolean;
  setPublisherStatisticsEnabled: (value: boolean) => void;
};

const AdvancedSettingsStatisticsTab = ({
  publisherStatisticsEnabled,
  setPublisherStatisticsEnabled,
}: AdvancedSettingsStatisticsTabProps): ReactElement => {
  const { t } = useTranslation();

  const statisticItems = [
    'packetsSent',
    'packetsLostSent',
    'bytesSent',
    'packetsReceived',
    'packetsLostReceived',
    'bytesReceived',
    'maxAssignedBitrate',
    'estimatedBandwidth',
  ].map((key) => ({
    label: t(`advancedSettings.statistics.metrics.${key}`),
    value: '--',
  }));

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.statistics')}
      </h2>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {t('advancedSettings.statistics.collection.label')}
        </h3>

        <AdvancedSettingsBooleanField
          label={t('advancedSettings.statistics.collection.enablePublisher.label')}
          checked={publisherStatisticsEnabled}
          onChange={setPublisherStatisticsEnabled}
          description={t('advancedSettings.statistics.collection.enablePublisher.description')}
        />
      </div>

      <AdvancedSettingsStatisticsList
        title={t('advancedSettings.statistics.sections.audio')}
        items={statisticItems}
      />

      <AdvancedSettingsStatisticsList
        title={t('advancedSettings.statistics.sections.video')}
        items={statisticItems}
      />
    </div>
  );
};

export default AdvancedSettingsStatisticsTab;
