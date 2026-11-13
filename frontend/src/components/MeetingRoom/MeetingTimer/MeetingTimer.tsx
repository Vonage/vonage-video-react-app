import type { ReactElement } from 'react';
import { isNotNil } from '@common/assertions';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import type { ScheduleWindow } from '@common/types';
import formatMinutesAndSeconds from '@utils/formatMinutesAndSeconds';
import isSignedIn from '@utils/isSignedIn';
import MeetingEndingDialog from '../MeetingEndingDialog';
import useMeetingSecondsLeft from './hooks/useMeetingSecondsLeft';
import meetingTimerVariants from './meetingTimerVariants';

export type MeetingTimerProps = {
  scheduleWindow: ScheduleWindow;
  isCompact?: boolean;
};

const MeetingTimer = ({ scheduleWindow, isCompact = false }: MeetingTimerProps): ReactElement => {
  const { t } = useTranslation();
  const secondsLeft = useMeetingSecondsLeft({ scheduleWindow });
  const isAllowedToExtend = isSignedIn();

  return (
    <>
      <div
        role="timer"
        aria-label={t('meetingTimer.ariaLabel')}
        className={meetingTimerVariants({ isCompact })}
      >
        <VividIcon
          name="clock-line"
          customSize={isCompact ? -6 : -5}
          style={{ color: 'var(--vera-on-warning)' }}
        />
        {isNotNil(secondsLeft) &&
          t('meetingTimer.timeLeft', {
            timeLeft: formatMinutesAndSeconds({ totalSeconds: secondsLeft, t }),
          })}
      </div>
      {isAllowedToExtend && <MeetingEndingDialog />}
    </>
  );
};

export default MeetingTimer;
