export type MeetingDateFormat = 'dateTime' | 'date' | 'time';

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
};

/**
 * Formats an epoch-milliseconds timestamp in the user's language.
 */
function formatMeetingDate({
  timestamp,
  locale,
  format,
}: {
  timestamp: number;
  locale: string;
  format: MeetingDateFormat;
}): string {
  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(timestamp);
}

export default formatMeetingDate;
