import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';
import useLeaveMeeting from '@hooks/useLeaveMeeting';
import { useMiniMode } from '@Context/MiniMode';

const useLeaveAtMeetingEnd = () => {
  const { t } = useTranslation();
  const scheduleWindow = serverSettings$.useScheduleWindow();
  const leaveMeeting = useLeaveMeeting();
  const { exit: exitMiniMode } = useMiniMode();
  const serverSettings = serverSettings$.use.api();

  const endsAtMs = scheduleWindow?.endsAtMs;

  const leaveAtEnd = useEffectEvent(function leaveEndedMeeting() {
    exitMiniMode();
    leaveMeeting({ header: t('meetingTimer.meetingEnded') });
  });

  useEffect(
    function subscribeToMeetingEnd() {
      if (isNil(endsAtMs)) return;

      const unsubscribe = serverSettings.subscribe(
        serverSettings.actions.getSecondsUntilEnd,
        leaveIfEnded,
        { skipFirst: true }
      );

      function leaveIfEnded(secondsUntilEnd: number | null) {
        const hasMeetingEnded = secondsUntilEnd === 0;
        if (!hasMeetingEnded) return;

        unsubscribe();
        leaveAtEnd();
      }

      leaveIfEnded(serverSettings.actions.getSecondsUntilEnd());

      return unsubscribe;
    },
    [serverSettings, endsAtMs]
  );
};

export default useLeaveAtMeetingEnd;
