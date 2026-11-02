import type { MeetingRole } from '../types/MeetingRole';

const roleIconName: Record<MeetingRole, string> = {
  moderator: 'key-line',
  publisher: 'video-line',
  subscriber: 'eye-line',
  publisherOnly: 'broadcast-line',
};

export default roleIconName;
