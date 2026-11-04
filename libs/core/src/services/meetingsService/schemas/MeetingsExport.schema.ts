import z from 'zod';
import { isSessionKeyLike } from '@common/assertions';
import type { SessionKey } from '@common/types';
import toSavedMeetingId from '../helpers/toSavedMeetingId';
import type { MeetingsExport, SavedMeeting } from '../types';

const SavedMeetingSchema = z
  .object({
    sessionKey: z.string().refine(isSessionKeyLike),
    savedAt: z.number(),
    archivedAt: z.number().nullable(),
  })
  .transform((meeting): SavedMeeting => {
    const sessionKey = meeting.sessionKey as SessionKey;

    return { ...meeting, sessionKey, id: toSavedMeetingId({ sessionKey }) };
  });

export const MeetingsExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  meetings: z.array(SavedMeetingSchema),
});

export function parseMeetingsExport(data: unknown): MeetingsExport {
  return MeetingsExportSchema.parse(data);
}

export default MeetingsExportSchema;
