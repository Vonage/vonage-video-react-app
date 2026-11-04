import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import type { ScheduleWindow } from '@common/types';
import getTimeLeftText from './helpers/getTimeLeftText';
import isMeetingEndingSoon from './helpers/isMeetingEndingSoon';
import useEndOfMeetingWarning from './hooks/useEndOfMeetingWarning';
import useMeetingSecondsLeft from './hooks/useMeetingSecondsLeft';
import meetingTimerVariants from './meetingTimerVariants';

/**
 * Time left in a scheduled meeting; it turns amber in the last five minutes.
 */
export type MeetingTimerProps = {
  scheduleWindow: ScheduleWindow;
  isCompact?: boolean;
};

const MeetingTimer = ({ scheduleWindow, isCompact = false }: MeetingTimerProps): ReactElement => {
  const { t } = useTranslation();
  const { secondsLeft, isServerTimeKnown } = useMeetingSecondsLeft({ scheduleWindow });
  const isEndingSoon = isMeetingEndingSoon(secondsLeft);

  useEndOfMeetingWarning({ shouldWarn: isEndingSoon && isServerTimeKnown });

  return (
    <div
      role="timer"
      aria-label={t('meetingTimer.ariaLabel')}
      className={meetingTimerVariants({ isEndingSoon, isCompact })}
    >
      <VividIcon
        name="clock-line"
        customSize={isCompact ? -6 : -5}
        style={{ color: isEndingSoon ? 'var(--vera-on-warning)' : 'var(--vera-on-dark-grey)' }}
      />
      {t('meetingTimer.timeLeft', { timeLeft: getTimeLeftText({ secondsLeft, t }) })}
    </div>
  );
};

export default MeetingTimer;
