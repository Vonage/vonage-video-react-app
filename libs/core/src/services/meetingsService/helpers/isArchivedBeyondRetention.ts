import { isNil } from '@common/assertions';
import type { SavedMeeting } from '../types';

const archivedMeetingRetentionMs = 30 * 24 * 60 * 60 * 1000;

function isArchivedBeyondRetention({ archivedAt }: SavedMeeting): boolean {
  if (isNil(archivedAt)) return false;

  return Date.now() - archivedAt > archivedMeetingRetentionMs;
}

export default isArchivedBeyondRetention;
