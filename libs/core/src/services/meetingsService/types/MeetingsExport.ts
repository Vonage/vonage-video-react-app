import type { SavedMeeting } from './SavedMeeting';

export type MeetingsExport = {
  version: 1;
  exportedAt: number;
  meetings: SavedMeeting[];
};

export default MeetingsExport;
