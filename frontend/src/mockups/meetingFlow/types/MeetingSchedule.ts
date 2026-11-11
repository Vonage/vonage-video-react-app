import type { MeetingRecurrence } from './MeetingRecurrence';

export type MeetingSchedule = {
  startsAt: Date;
  durationMinutes: number;
  recurrence: MeetingRecurrence;
};

export default MeetingSchedule;
