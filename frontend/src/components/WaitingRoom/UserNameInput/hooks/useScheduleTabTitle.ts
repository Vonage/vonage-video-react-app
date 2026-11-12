import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import formatCountdown from '../helpers/formatCountdown';
import type { ScheduleStatus } from '../types/ScheduleStatus';

const useScheduleTabTitle = ({
  scheduleStatus,
  meetingName,
}: {
  scheduleStatus: ScheduleStatus;
  meetingName: string | undefined;
}) => {
  const { t } = useTranslation();

  const tabTitle = (() => {
    if (isNil(meetingName)) return null;
    if (scheduleStatus.kind === 'started') {
      return t('waitingRoom.schedule.tabTitle.started', { name: meetingName });
    }
    if (scheduleStatus.kind === 'withinFiveMinutes') {
      return t('waitingRoom.schedule.tabTitle.countdown', {
        countdown: formatCountdown(scheduleStatus.secondsLeft),
        name: meetingName,
      });
    }
    return null;
  })();

  useEffect(() => {
    if (isNil(tabTitle)) return;

    const previousTitle = document.title;
    document.title = tabTitle;

    return () => {
      document.title = previousTitle;
    };
  }, [tabTitle]);
};

export default useScheduleTabTitle;
