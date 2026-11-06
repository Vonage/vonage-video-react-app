import type { MeetingDurationMinutes } from '../types/MeetingDurationMinutes';

const meetingDurationLabelKeys: Record<MeetingDurationMinutes, string> = {
  60: 'createRoomWizard.details.duration.oneHour',
  120: 'createRoomWizard.details.duration.twoHours',
  1440: 'createRoomWizard.details.duration.twentyFourHours',
};

export default meetingDurationLabelKeys;
