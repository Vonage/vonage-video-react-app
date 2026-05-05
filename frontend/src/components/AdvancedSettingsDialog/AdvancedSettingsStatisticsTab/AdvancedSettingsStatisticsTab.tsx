import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { AdvancedSettingsBooleanField } from '../AdvancedSettingsBooleanField';
import { AdvancedSettingsStatisticsGroup } from '../AdvancedSettingsStatisticsGroup';

const { setPublisherStatisticsEnabled } = advancedSettings$.actions;

const AdvancedSettingsStatisticsTab = (): ReactElement => {
  const { t } = useTranslation();
  const publisherStatisticsEnabled = advancedSettings$.use.select(
    (state) => state.publisherStatisticsEnabled
  );

  // TODO: populate from live publisher stats once SDK wiring is in place
  const publisherAudioStatistics: { label: string; value: string }[] = [];
  // TODO: populate from live publisher stats once SDK wiring is in place
  const publisherVideoStatistics: { label: string; value: string }[] = [];
  // TODO: populate per-subscriber stats groups once SDK wiring is in place
  const subscriberStatisticsGroups: Array<{
    title: string;
    audioItems: { label: string; value: string }[];
    videoItems: { label: string; value: string }[];
  }> = [];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.statistics')}
      </h2>
      <div className="flex flex-col gap-1.5">
        <AdvancedSettingsBooleanField
          label={t('advancedSettings.statistics.collection.enablePublisher.label')}
          checked={publisherStatisticsEnabled}
          onChange={setPublisherStatisticsEnabled}
          description={t('advancedSettings.statistics.collection.enablePublisher.description')}
        />
      </div>

      <div className="flex flex-col gap-4">
        <AdvancedSettingsStatisticsGroup
          title={t('advancedSettings.statistics.groups.publisher')}
          audioTitle={t('advancedSettings.statistics.sections.audio')}
          videoTitle={t('advancedSettings.statistics.sections.video')}
          audioItems={publisherAudioStatistics}
          videoItems={publisherVideoStatistics}
          emptyLabel={t('advancedSettings.statistics.empty')}
          defaultExpanded
        />

        {subscriberStatisticsGroups.map((subscriberStatisticsGroup) => (
          <AdvancedSettingsStatisticsGroup
            key={subscriberStatisticsGroup.title}
            title={subscriberStatisticsGroup.title}
            audioTitle={t('advancedSettings.statistics.sections.audio')}
            videoTitle={t('advancedSettings.statistics.sections.video')}
            audioItems={subscriberStatisticsGroup.audioItems}
            videoItems={subscriberStatisticsGroup.videoItems}
            emptyLabel={t('advancedSettings.statistics.empty')}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettingsStatisticsTab;
