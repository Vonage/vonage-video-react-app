import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import formatMeetingDate from '../../helpers/formatMeetingDate';

export type AutoJoinTextProps = ComponentProps<'p'> & {
  startsAtMs: number;
};

const AutoJoinText = ({ startsAtMs, className, ...props }: AutoJoinTextProps): ReactElement => {
  const { t, i18n } = useTranslation();

  return (
    <p
      className={classNames('font-vera-plain text-vera-caption text-vera-text-tertiary', className)}
      {...props}
    >
      {t('waitingRoom.schedule.autoJoinAt', {
        time: formatMeetingDate({ timestamp: startsAtMs, locale: i18n.language, format: 'time' }),
      })}
    </p>
  );
};

export default AutoJoinText;
