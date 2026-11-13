import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil, isNotNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';
import useLeaveMeeting from '@hooks/useLeaveMeeting';
import useSessionContext from '@hooks/useSessionContext';
import { useMiniMode } from '@Context/MiniMode';
import useMeetingScheduleWindow from './useMeetingScheduleWindow';

const useLeaveAtMeetingEnd = () => {
  const { t } = useTranslation();
  const { sessionKey } = useSessionContext();
  const scheduleWindow = useMeetingScheduleWindow();
  const leaveMeeting = useLeaveMeeting();
  const { exit: exitMiniMode } = useMiniMode();
  const serverSettingsApi = serverSettings$.use.api();

  serverSettings$.useServerSettings({
    sessionKey,
    queryOptions: { enabled: isNotNil(scheduleWindow) },
  });

  const endsAtMs = scheduleWindow?.endsAtMs;

  const leaveAtEnd = useEffectEvent(() => {
    exitMiniMode();
    leaveMeeting({ header: t('meetingTimer.meetingEnded') });
  });

  useEffect(() => {
    if (isNil(endsAtMs)) return;

    const hasEnded$ = serverSettingsApi.createObservable(
      (state) => isNotNil(state.now) && state.now >= endsAtMs
    );

    hasEnded$.subscribe((hasEnded) => {
      if (!hasEnded) return;

      hasEnded$.dispose();
      leaveAtEnd();
    });

    return hasEnded$.dispose;
  }, [serverSettingsApi, endsAtMs]);
};

export default useLeaveAtMeetingEnd;
