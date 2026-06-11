import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import usePublisherContext from '@hooks/usePublisherContext';
import SwitchField from '@ui/SwitchField';
import PublisherStatistics from './components/PublisherStatistics';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import SubscriberStatistics from './components/SubscriberStatistics';
import useSessionContext from '@hooks/useSessionContext';

const { setPublisherStatisticsEnabled } = advancedSettings$.actions;

const AdvancedSettingsStatisticsTab = (): ReactElement => {
  const { t } = useTranslation();
  const { publisher: meetingPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const { subscriberWrappers } = useSessionContext();

  const publisher = meetingPublisher ?? previewPublisher;

  const publisherStatisticsEnabled = advancedSettings$.use.select(
    (state) => state.publisherStatisticsEnabled
  );

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
        {publisher && <PublisherStatistics publisher={publisher} />}

        {subscriberWrappers.length > 0 && (
          <h4 className="font-vera-plain text-vera-heading-4 text-vera-secondary">
            {t('advancedSettings.statistics.groups.subscribers')}
          </h4>
        )}

        {subscriberWrappers.map(({ subscriber }, index) => (
          <SubscriberStatistics subscriber={subscriber} key={subscriber.id ?? index} />
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettingsStatisticsTab;
