import type { SessionKey } from '@common/types';
import type { SavedMeetingId } from '../types';

function toSavedMeetingId({ sessionKey }: { sessionKey: SessionKey }): SavedMeetingId {
  const signature = sessionKey.split('.')[2];

  return `meeting:${signature}` as SavedMeetingId;
}

export default toSavedMeetingId;
