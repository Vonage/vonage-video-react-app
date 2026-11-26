import type { SavedMeeting } from '../types/SavedMeeting';

export type MeetingDayGroupKey = 'today' | 'tomorrow' | 'later' | 'anytime';

export type MeetingDayGroup = {
  key: MeetingDayGroupKey;
  meetings: SavedMeeting[];
};

const groupOrder: MeetingDayGroupKey[] = ['today', 'tomorrow', 'later', 'anytime'];

/**
 * Splits meetings into agenda sections relative to `now`, sorted by start time.
 */
function groupMeetingsByDay({
  meetings,
  now,
}: {
  meetings: SavedMeeting[];
  now: Date;
}): MeetingDayGroup[] {
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const getKey = (meeting: SavedMeeting): MeetingDayGroupKey => {
    if (meeting.schedule === null) return 'anytime';
    if (meeting.schedule.startsAt < startOfTomorrow) return 'today';
    if (meeting.schedule.startsAt < startOfDayAfter) return 'tomorrow';
    return 'later';
  };

  const sortedMeetings = [...meetings].sort(
    (first, second) =>
      (first.schedule?.startsAt.getTime() ?? Infinity) -
      (second.schedule?.startsAt.getTime() ?? Infinity)
  );

  return groupOrder
    .map((key) => ({ key, meetings: sortedMeetings.filter((meeting) => getKey(meeting) === key) }))
    .filter(({ meetings }) => meetings.length > 0);
}

export default groupMeetingsByDay;
