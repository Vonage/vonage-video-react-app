import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { getFormattedDate, getFormattedTime } from '@utils/dateTime';
import getCountdownText from '../../helpers/getCountdownText';
import type { WaitingStatus } from '../../types/ScheduleStatus';

export type JoinBlockerTextProps = ComponentProps<'p'> & {
  waitingStatus: WaitingStatus;
};

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
        date: getFormattedDate(locale, waitingStatus.startsAtMs),
      });
    }
    if (waitingStatus.kind === 'withinDay') {
      return t('waitingRoom.schedule.joinOpensAt', {
        time: getFormattedTime(locale, waitingStatus.startsAtMs),
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
