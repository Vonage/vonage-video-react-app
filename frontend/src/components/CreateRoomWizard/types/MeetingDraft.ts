import type { MeetingDurationMinutes } from './MeetingDurationMinutes';

export type MeetingDraft = {
  name: string;
  isScheduled: boolean;
  startDate: string;
  startTime: string;
  durationMinutes: MeetingDurationMinutes;
};

export default MeetingDraft;
