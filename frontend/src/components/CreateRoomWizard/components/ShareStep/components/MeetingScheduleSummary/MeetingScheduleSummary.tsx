import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { getFormattedDate, getFormattedTime } from '@utils/dateTime';
import createRoomWizard$ from '../../../../context/createRoomWizardContext';
import meetingDurationLabelKeys from '../../../../constants/meetingDurationLabelKeys';
import getMeetingStartsAt from '../../../../helpers/getMeetingStartsAt';

/**
 * One line with the start and the duration of a scheduled meeting, for example "Tue, Nov 3, 9:30 AM · 1 hour".
 */
const MeetingScheduleSummary = ({ className, ...props }: ComponentProps<'span'>): ReactElement => {
  const { t, i18n } = useTranslation();
  const startDate = createRoomWizard$.use.select((state) => state.startDate);
  const startTime = createRoomWizard$.use.select((state) => state.startTime);
  const durationMinutes = createRoomWizard$.use.select((state) => state.durationMinutes);

  const startsAt = getMeetingStartsAt({ startDate, startTime });
  const start = `${getFormattedDate(i18n.language, startsAt)}, ${getFormattedTime(i18n.language, startsAt)}`;

  return (
    <span
      className={classNames(
        'font-vera-plain text-vera-body-base text-vera-text-tertiary',
        className
      )}
      {...props}
    >
      {`${start} · ${t(meetingDurationLabelKeys[durationMinutes])}`}
    </span>
  );
};

export default MeetingScheduleSummary;
