import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import formatCountdown from '../helpers/formatCountdown';
import type { ScheduleStatus } from '@core/stores/serverSettings';

const useScheduleTabTitle = ({
  scheduleStatus,
  meetingName,
}: {
  scheduleStatus: ScheduleStatus;
  meetingName: string | undefined;
}) => {
  const { t } = useTranslation();

  const tabTitle = (() => {
    if (scheduleStatus.kind === 'started') {
      return t(
        isNil(meetingName)
          ? 'waitingRoom.schedule.tabTitle.startedUnnamed'
          : 'waitingRoom.schedule.tabTitle.started',
        { name: meetingName }
      );
    }
    if (scheduleStatus.kind === 'withinFiveMinutes') {
      return t(
        isNil(meetingName)
          ? 'waitingRoom.schedule.tabTitle.countdownUnnamed'
          : 'waitingRoom.schedule.tabTitle.countdown',
        { countdown: formatCountdown(scheduleStatus.secondsLeft), name: meetingName }
      );
    }
    return null;
  })();

  useEffect(
    function updateScheduleTabTitle() {
      if (isNil(tabTitle)) return;

      const previousTitle = document.title;
      document.title = tabTitle;

      return function restoreTabTitle() {
        document.title = previousTitle;
      };
    },
    [tabTitle]
  );
};

export default useScheduleTabTitle;
