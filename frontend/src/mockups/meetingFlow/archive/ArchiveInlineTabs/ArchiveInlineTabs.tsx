import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Card from '@ui/components/Card';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../components/Notice';
import SegmentedTab from '../../components/SegmentedTab';
import CreateOrJoinCard from '../../landing/components/CreateOrJoinCard';
import LandingShell from '../../landing/components/LandingShell';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';
import ArchivedMeetingRow from '../components/ArchivedMeetingRow';

/**
 * Archive variant A: the meetings card from landing A gains Upcoming/Archived tabs and an export/import footer.
 */
const ArchiveInlineTabs = (): ReactElement => {
  const { t } = useTranslation();
  const upcomingCount = useUpcomingMeetings().length;
  const archivedMeetings = useArchivedMeetings();

  return (
    <LandingShell>
      <div className="flex w-full flex-col gap-6 py-6 lg:max-w-125">
        <CreateOrJoinCard />
        <Card className="gap-4">
          <div role="tablist" className="flex w-full gap-1 rounded-2xl bg-vera-background p-1">
            <SegmentedTab isSelected={false}>
              {t('meetingFlow.archive.tabs.upcoming')} ({upcomingCount})
            </SegmentedTab>
            <SegmentedTab isSelected>
              {t('meetingFlow.archive.tabs.archived')} ({archivedMeetings.length})
            </SegmentedTab>
          </div>
          <ul className="flex w-full flex-col">
            {archivedMeetings.map((meeting) => (
              <ArchivedMeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </ul>
          <div className="flex w-full flex-col gap-3 border-t border-vera-border pt-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outlined"
                startIcon={
                  <VividIcon
                    name="download-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-primary)' }}
                  />
                }
              >
                {t('meetingFlow.archive.export')}
              </Button>
              <Button
                variant="text"
                startIcon={
                  <VividIcon
                    name="upload-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-primary)' }}
                  />
                }
              >
                {t('meetingFlow.archive.import')}
              </Button>
            </div>
            <Notice tone="warning">{t('meetingFlow.archive.exportWarning')}</Notice>
          </div>
        </Card>
      </div>
    </LandingShell>
  );
};

export default ArchiveInlineTabs;
