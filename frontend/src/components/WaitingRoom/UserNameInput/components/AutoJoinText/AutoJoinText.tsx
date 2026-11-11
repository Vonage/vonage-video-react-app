import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { getFormattedTime } from '@utils/dateTime';

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
        time: getFormattedTime(i18n.language, startsAtMs),
      })}
    </p>
  );
};

export default AutoJoinText;
