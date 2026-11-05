import { useServerSettings } from '@core/hooks';
import type { ScheduleWindow } from '@common/types';
import useServerNow from '@web/hooks/useServerNow';
import useSessionContext from '@hooks/useSessionContext';

const useMeetingSecondsLeft = ({ scheduleWindow }: { scheduleWindow: ScheduleWindow }): number => {
  const { sessionKey } = useSessionContext();
  const { data: serverSettings } = useServerSettings({ sessionKey });
  const now = useServerNow({
    clockOffset: serverSettings?.clockOffset ?? 0,
    isTicking: true,
  });

  return Math.max(0, Math.ceil((scheduleWindow.endsAt - now) / 1000));
};

export default useMeetingSecondsLeft;
