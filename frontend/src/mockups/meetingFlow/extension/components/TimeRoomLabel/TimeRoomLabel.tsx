import type { ReactElement } from 'react';
import formatMeetingDate from '../../../helpers/formatMeetingDate';
import useLocale from '../../../hooks/useLocale';
import meetingExtension$ from '../../context/meetingExtensionContext';

/**
 * Static copy of the toolbar's time and room name label.
 */
const TimeRoomLabel = (): ReactElement => {
  const locale = useLocale();
  const now = meetingExtension$.use.select((state) => state.now);
  const meetingName = meetingExtension$.use.select((state) => state.meetingName);

  return (
    <span className="truncate text-vera-accent max-sm:hidden">
      {formatMeetingDate({ date: now, locale, format: 'time' })} | {meetingName}
    </span>
  );
};

export default TimeRoomLabel;
