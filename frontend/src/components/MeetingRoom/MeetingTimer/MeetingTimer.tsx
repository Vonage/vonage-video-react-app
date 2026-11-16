import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import { isNotNil } from '@common/assertions';
import formatMinutesAndSeconds from '@utils/formatMinutesAndSeconds';
import { serverSettings$ } from '@core/stores';
import meetingTimerVariants from './meetingTimerVariants';

export type MeetingTimerProps = {
  isCompact?: boolean;
};

const MeetingTimer = ({ isCompact = false }: MeetingTimerProps): ReactElement => {
  const { t } = useTranslation();
  const secondsLeft = serverSettings$.useSecondsUntilEnd();

  return (
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
  );
};

export default MeetingTimer;
