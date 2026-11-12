import type { ReactElement } from 'react';
import { isNil } from '@common/assertions';
import { useTranslation } from 'react-i18next';
import type { ScheduleWindow } from '@common/types';
import { useMeetingSecondsLeft } from '@components/MeetingRoom/MeetingTimer';
import { getFormattedTime } from '@utils/dateTime';
import formatMinutesAndSeconds from '@utils/formatMinutesAndSeconds';

export type MeetingProgressProps = {
  scheduleWindow: ScheduleWindow;
};

/**
 * A bar from the meeting's start to its end, filled up to now, with the time left under it.
 */
const MeetingProgress = ({ scheduleWindow }: MeetingProgressProps): ReactElement => {
  const { t, i18n } = useTranslation();
  const secondsLeft = useMeetingSecondsLeft({ scheduleWindow });
  const totalMilliseconds = scheduleWindow.endsAtMs - scheduleWindow.startsAtMs;
  const elapsedPercent = isNil(secondsLeft)
    ? undefined
    : Math.min(100, Math.max(0, 100 - ((secondsLeft * 1000) / totalMilliseconds) * 100));
  const timeLeftText = isNil(secondsLeft)
    ? undefined
    : t('meetingTimer.timeLeft', {
        timeLeft: formatMinutesAndSeconds({ totalSeconds: secondsLeft, t }),
      });

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isNil(elapsedPercent) ? undefined : Math.round(elapsedPercent)}
        aria-valuetext={timeLeftText}
        className="h-2 w-full overflow-hidden rounded-full bg-vera-background"
      >
        <div
          className="h-full rounded-full bg-vera-primary"
          style={{ width: `${elapsedPercent ?? 0}%` }}
        />
      </div>
      <div className="flex justify-between font-vera-plain text-vera-caption tabular-nums text-vera-text-tertiary">
        <span>{getFormattedTime(i18n.language, scheduleWindow.startsAtMs)}</span>
        <span>{getFormattedTime(i18n.language, scheduleWindow.endsAtMs)}</span>
      </div>
      <p className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
        {timeLeftText}
      </p>
    </div>
  );
};

export default MeetingProgress;
