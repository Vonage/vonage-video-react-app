export type MeetingDateFormat = 'dateTime' | 'date' | 'time' | 'weekdayTime';

const formatOptions: Record<MeetingDateFormat, Intl.DateTimeFormatOptions> = {
  dateTime: {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  date: { weekday: 'short', month: 'short', day: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit' },
  weekdayTime: { weekday: 'long', hour: 'numeric', minute: '2-digit' },
};

/**
 * Formats a meeting date in the user's language.
 */
function formatMeetingDate({
  date,
  locale,
  format,
}: {
  date: Date;
  locale: string;
  format: MeetingDateFormat;
}): string {
  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(date);
}

export default formatMeetingDate;
