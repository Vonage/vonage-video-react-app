import { describe, expect, it, vi } from 'vitest';
import { serverArchives } from './data';
import { getArchives } from '..';
import type { ServerArchive } from '../model';
import type { VideoClient } from '@core/services';

const mockSearchArchivesQuery = vi.fn((_args?: unknown) =>
  Promise.resolve({ items: [] as ServerArchive[] })
);

const mockVideoClient = {
  searchArchives: (...args: unknown[]) => mockSearchArchivesQuery(...args),
} as unknown as VideoClient;

describe('getArchives', () => {
  it('it returns an object with array of Archives and hasPending flag', async () => {
    mockSearchArchivesQuery.mockResolvedValue({ items: serverArchives });
    const archives = await getArchives({
      locale: 'en',
      sessionKey: 'test-session-id',
      videoClient: mockVideoClient,
    });
    expect(archives).toEqual({
      archives: [
        {
          createdAt: 1725268594000,
          createdAtFormatted: 'Mon, Sep 2 5:16 AM',
          duration: 0,
          id: 'dc91ede6-0d1a-4de6-90d8-692c2113b34a',
          size: 0,
          status: 'pending',
          url: null,
        },
        {
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
          duration: 56,
          id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
          size: 278545,
          status: 'available',
          url: 'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
        },
        {
          createdAt: 1725268111000,
          createdAtFormatted: 'Mon, Sep 2 5:08 AM',
          duration: 13,
          id: '88417e46-6459-435b-b1a4-8524db79946c',
          size: 911104,
          status: 'failed',
          url: null,
        },
      ],
      hasPending: true,
    });
  });

  it('it returns object with empty array when no archives', async () => {
    mockSearchArchivesQuery.mockResolvedValue({ items: [] });
    const archives = await getArchives({
      locale: 'en',
      sessionKey: 'test-session-id',
      videoClient: mockVideoClient,
    });
    expect(archives).toEqual({
      archives: [],
      hasPending: false,
    });
  });

  it('it throws with error when api call throws', async () => {
    mockSearchArchivesQuery.mockRejectedValue(new Error('Network Error'));
    await expect(
      getArchives({ locale: 'en', sessionKey: 'test-session-id', videoClient: mockVideoClient })
    ).rejects.toThrowError();
  });
});
