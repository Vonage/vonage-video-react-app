import { describe, expect, it } from 'vitest';
import type { MeetingDraft } from '../../types/MeetingDraft';
import getCreateSessionPayload from './getCreateSessionPayload';

const unscheduledDraft: MeetingDraft = {
  name: '',
  isScheduled: false,
  startDate: '2030-01-15',
  startTime: '09:30',
  durationMinutes: 60,
};

describe('getCreateSessionPayload', () => {
  it('sends only the room name for an unscheduled meeting, falling back to a random one', () => {
    expect(
      getCreateSessionPayload({ draft: unscheduledDraft, fallbackRoomName: 'red-aardvark' })
    ).toEqual({ roomName: 'red-aardvark' });
    expect(
      getCreateSessionPayload({
        draft: { ...unscheduledDraft, name: 'weekly-sync' },
        fallbackRoomName: 'red-aardvark',
      })
    ).toEqual({ roomName: 'weekly-sync' });
  });

  it.each([60, 120, 1440] as const)(
    'signs the local start and the %i minute preset into the schedule',
    (durationMinutes) => {
      const payload = getCreateSessionPayload({
        draft: { ...unscheduledDraft, name: 'weekly-sync', isScheduled: true, durationMinutes },
        fallbackRoomName: 'red-aardvark',
      });

      expect(payload).toEqual({
        roomName: 'weekly-sync',
        schedule: { startsAt: new Date(2030, 0, 15, 9, 30).getTime(), durationMinutes },
      });
    }
  );
});
