import type { SessionKey } from '@common/types';
import type { SavedMeetingId } from './SavedMeetingId';

export type SavedMeeting = {
  id: SavedMeetingId;
  sessionKey: SessionKey;
  savedAt: number;
  archivedAt: number | null;
};

export default SavedMeeting;
