import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useServerSettings } from '@core/hooks';
import { isNil, isNotNil } from '@common/assertions';
import useLeaveMeeting from '@hooks/useLeaveMeeting';
import useSessionContext from '@hooks/useSessionContext';
import { useMiniMode } from '@Context/MiniMode';
import useMeetingScheduleWindow from './useMeetingScheduleWindow';

const checkIntervalMilliseconds = 1000;

const useLeaveAtMeetingEnd = () => {
  const { t } = useTranslation();
  const { sessionKey } = useSessionContext();
  const scheduleWindow = useMeetingScheduleWindow();
  const leaveMeeting = useLeaveMeeting();
  const { exit: exitMiniMode } = useMiniMode();

  const { data: serverSettings } = useServerSettings({
    sessionKey,
    queryOptions: { enabled: isNotNil(scheduleWindow) },
  });

  const clockOffset = serverSettings?.clockOffset ?? 0;

  const leaveAtEnd = useEffectEvent(() => {
    exitMiniMode();
    leaveMeeting({ header: t('meetingTimer.meetingEnded') });
  });

  useEffect(() => {
    if (isNil(scheduleWindow)) return;

    const intervalId = setInterval(() => {
      const hasEnded = Date.now() + clockOffset >= scheduleWindow.endsAt;
      if (!hasEnded) return;

      clearInterval(intervalId);
      leaveAtEnd();
    }, checkIntervalMilliseconds);

    return () => clearInterval(intervalId);
  }, [scheduleWindow, clockOffset]);
};

export default useLeaveAtMeetingEnd;
