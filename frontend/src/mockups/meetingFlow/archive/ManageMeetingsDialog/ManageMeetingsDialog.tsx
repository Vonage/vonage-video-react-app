import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import DialogFrame from '../../components/DialogFrame';
import Notice from '../../components/Notice';
import UpcomingMeetingRow from '../../landing/components/UpcomingMeetingRow';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';
import ArchivedMeetingRow from '../components/ArchivedMeetingRow';
import BackupPanel from './components/BackupPanel';
import ManageMeetingsSidebar from './components/ManageMeetingsSidebar';
import manageMeetingsDialog$ from './context/manageMeetingsDialogContext';

/**
 * Archive variant B: a "Manage meetings" dialog with the same sidebar layout as Advanced settings.
 */
const ManageMeetingsDialog = (): ReactElement => {
  const { t } = useTranslation();
  const selectedTab = manageMeetingsDialog$.use.select((state) => state.selectedTab);
  const upcomingMeetings = useUpcomingMeetings();
  const archivedMeetings = useArchivedMeetings();

  const tabContent = (() => {
    if (selectedTab === 'backup') return <BackupPanel />;
    if (selectedTab === 'upcoming') {
      return (
        <ul className="flex flex-col">
          {upcomingMeetings.map((meeting) => (
            <UpcomingMeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </ul>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col">
          {archivedMeetings.map((meeting) => (
            <ArchivedMeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </ul>
        <Notice tone="information">{t('meetingFlow.archive.localOnly')}</Notice>
      </div>
    );
  })();

  return (
    <DialogFrame title={t('meetingFlow.archive.manage.title')} size="tall">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ManageMeetingsSidebar />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{tabContent}</div>
      </div>
    </DialogFrame>
  );
};

export default ManageMeetingsDialog;
