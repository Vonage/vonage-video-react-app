import { useServerSettings } from '@core/hooks';
import { isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import useServerNow from '@web/hooks/useServerNow';

/**
 * Seconds left until the meeting's scheduled end, kept current by the server clock.
 */
const useMeetingSecondsLeft = ({ scheduleWindow }: { scheduleWindow: ScheduleWindow }) => {
  const { data: serverSettings } = useServerSettings();
  const now = useServerNow({
    clockOffset: serverSettings?.clockOffset ?? 0,
    isTicking: true,
  });

  const secondsLeft = Math.max(0, Math.ceil((scheduleWindow.endsAt - now) / 1000));

  return { secondsLeft, isServerTimeKnown: isNotNil(serverSettings) };
};

export default useMeetingSecondsLeft;
