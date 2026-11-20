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

  it('sends the local start and duration in the schedule', () => {
    const payload = getCreateSessionPayload({
      draft: { ...unscheduledDraft, name: 'weekly-sync', isScheduled: true, durationMinutes: 120 },
      fallbackRoomName: 'red-aardvark',
    });

    expect(payload).toEqual({
      roomName: 'weekly-sync',
      schedule: { startsAt: new Date(2030, 0, 15, 9, 30).getTime(), durationMinutes: 120 },
    });
  });
});
