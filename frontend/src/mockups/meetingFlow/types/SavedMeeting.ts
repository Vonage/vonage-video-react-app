import type { MeetingSchedule } from './MeetingSchedule';
import type { RoleLink } from './RoleLink';
import type { SavedMeetingId } from './SavedMeetingId';

export type SavedMeeting = {
  id: SavedMeetingId;
  name: string | null;
  createdAt: Date;
  schedule: MeetingSchedule | null;
  links: RoleLink[];
  isArchived: boolean;
};

export default SavedMeeting;
