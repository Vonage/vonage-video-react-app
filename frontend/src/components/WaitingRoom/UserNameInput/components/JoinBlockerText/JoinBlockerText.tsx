import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import getCountdownText from '../../helpers/getCountdownText';
import type { WaitingStatus } from '../../types/ScheduleStatus';

export type JoinBlockerTextProps = ComponentProps<'p'> & {
  waitingStatus: WaitingStatus;
};

/**
 * Says when Join opens while a scheduled meeting has not started.
 */
const JoinBlockerText = ({
  waitingStatus,
  className,
  ...props
}: JoinBlockerTextProps): ReactElement => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const text = (() => {
    if (waitingStatus.kind === 'daysAway') {
      return t('waitingRoom.schedule.joinOpensOn', {
        date: formatMeetingDate({ timestamp: waitingStatus.startsAt, locale, format: 'date' }),
      });
    }
    if (waitingStatus.kind === 'withinDay') {
      return t('waitingRoom.schedule.joinOpensAt', {
        time: formatMeetingDate({ timestamp: waitingStatus.startsAt, locale, format: 'time' }),
      });
    }
    return t('waitingRoom.schedule.joinOpensIn', {
      countdown: getCountdownText({ waitingStatus, t }),
    });
  })();

  return (
    <p
      className={classNames('font-vera-plain text-vera-caption text-vera-text-tertiary', className)}
      {...props}
    >
      {text}
    </p>
  );
};

export default JoinBlockerText;
