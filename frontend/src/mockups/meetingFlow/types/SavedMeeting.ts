import type { MeetingSchedule } from './MeetingSchedule';
import type { SavedMeetingId } from './SavedMeetingId';

export type SavedMeeting = {
  id: SavedMeetingId;
  name: string | null;
  createdAt: Date;
  schedule: MeetingSchedule | null;
  isArchived: boolean;
};

export default SavedMeeting;
