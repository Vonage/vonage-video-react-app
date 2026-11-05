import { useServerSettings } from '@core/hooks';
import type { ScheduleWindow } from '@common/types';
import useServerNow from '@web/hooks/useServerNow';

/**
 * Seconds left until the meeting's scheduled end, kept current by the server clock.
 */
const useMeetingSecondsLeft = ({ scheduleWindow }: { scheduleWindow: ScheduleWindow }): number => {
  const { data: serverSettings } = useServerSettings();
  const now = useServerNow({
    clockOffset: serverSettings?.clockOffset ?? 0,
    isTicking: true,
  });

  return Math.max(0, Math.ceil((scheduleWindow.endsAt - now) / 1000));
};

export default useMeetingSecondsLeft;
