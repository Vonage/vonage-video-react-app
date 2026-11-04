import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionKey } from '@common/types';
import { installIndexedDbFake } from '@core-test/fixtures';
import meetingsService from './meetingsService';

const dayMs = 24 * 60 * 60 * 1000;

describe('meetingsService', () => {
  beforeEach(() => {
    installIndexedDbFake();
  });

  it('keeps one record per sessionKey through archive, export, delete and import', async () => {
    expect.assertions(5);

    const firstSessionKey = 'header.payload.first-signature' as SessionKey;
    const secondSessionKey = 'header.payload.second-signature' as SessionKey;

    const savedMeeting = await meetingsService.putMeeting({ sessionKey: firstSessionKey });
    await meetingsService.putMeeting({ sessionKey: firstSessionKey });

    expect(await meetingsService.listMeetings()).toEqual([savedMeeting]);

    const archivedMeeting = await meetingsService.archiveMeeting({ id: savedMeeting.id });
    const exportedMeetings = await meetingsService.exportMeetings();

    expect(exportedMeetings).toEqual({
      version: 1,
      exportedAt: expect.any(Number),
      meetings: [archivedMeeting],
    });

    await meetingsService.deleteMeeting({ id: savedMeeting.id });

    expect(await meetingsService.listMeetings()).toEqual([]);

    await meetingsService.importMeetings(exportedMeetings);

    const importedMeetings = await meetingsService.importMeetings({
      ...exportedMeetings,
      meetings: [
        { ...archivedMeeting, archivedAt: null },
        { sessionKey: secondSessionKey, savedAt: 1, archivedAt: null },
      ],
    });

    expect(importedMeetings).toEqual([
      expect.objectContaining({ sessionKey: secondSessionKey, archivedAt: null }),
    ]);
    expect(await meetingsService.listMeetings()).toEqual([archivedMeeting, ...importedMeetings]);
  });

  it('purges only meetings archived more than 30 days ago', async () => {
    expect.assertions(1);

    const archivedAt = new Date('2025-01-01T00:00:00Z').getTime();
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(archivedAt);

    const expiredMeeting = await meetingsService.putMeeting({
      sessionKey: 'header.payload.expired' as SessionKey,
    });
    const boundaryMeeting = await meetingsService.putMeeting({
      sessionKey: 'header.payload.boundary' as SessionKey,
    });
    const activeMeeting = await meetingsService.putMeeting({
      sessionKey: 'header.payload.active' as SessionKey,
    });

    await meetingsService.archiveMeeting({ id: expiredMeeting.id });
    dateNowSpy.mockReturnValue(archivedAt + 1);
    const archivedBoundaryMeeting = await meetingsService.archiveMeeting({
      id: boundaryMeeting.id,
    });

    dateNowSpy.mockReturnValue(archivedAt + 30 * dayMs + 1);
    await meetingsService.purgeArchivedMeetings();

    expect(await meetingsService.listMeetings()).toEqual([archivedBoundaryMeeting, activeMeeting]);
  });
});
