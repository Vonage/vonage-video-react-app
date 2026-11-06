import { useSyncExternalStore } from 'react';
import { useServerSettings } from '@core/hooks';
import { isNil, isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import useSessionContext from '@hooks/useSessionContext';

const endingSoonMilliseconds = 5 * 60_000;
const checkIntervalMilliseconds = 1000;

const useShouldShowMeetingTimer = ({
  scheduleWindow,
}: {
  scheduleWindow: ScheduleWindow | null;
}): boolean => {
  const { sessionKey } = useSessionContext();
  const { data: serverSettings } = useServerSettings({
    sessionKey,
    queryOptions: { enabled: isNotNil(scheduleWindow) },
  });

  const getIsEndingSoon = () => {
    if (isNil(scheduleWindow) || isNil(serverSettings)) return false;
    const serverNow = Date.now() + serverSettings.clockOffset;
    return serverNow >= scheduleWindow.endsAt - endingSoonMilliseconds;
  };

  return useSyncExternalStore(subscribeToClock, getIsEndingSoon);
};

function subscribeToClock(onTick: () => void) {
  const intervalId = setInterval(onTick, checkIntervalMilliseconds);
  return () => clearInterval(intervalId);
}

export default useShouldShowMeetingTimer;
