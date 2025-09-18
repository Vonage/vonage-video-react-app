import { describe, expect, it, Mock, vi } from 'vitest';
import { AxiosError, AxiosResponse } from 'axios';
import { listArchives } from '../routes';
import { mockResponse } from './data';
import { getArchives } from '..';

vi.mock('../routes.ts');
const mockListArchives = listArchives as Mock<[], ReturnType<typeof listArchives>>;

describe('getArchives', () => {
  it('it returns an object with array of Archives and hasPending flag', async () => {
    mockListArchives.mockResolvedValue(mockResponse);
    const archives = await getArchives('en', 'roomName');
    expect(archives).toEqual({
      archives: [
        {
          createdAt: 1725268594000,
          createdAtFormatted: 'Mon, Sep 2 5:16 AM',
          id: 'dc91ede6-0d1a-4de6-90d8-692c2113b34a',
          status: 'pending',
          url: null,
        },
        {
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
          id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
          status: 'available',
          url: 'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
        },
        {
          createdAt: 1725268111000,
          createdAtFormatted: 'Mon, Sep 2 5:08 AM',
          id: '88417e46-6459-435b-b1a4-8524db79946c',
          status: 'failed',
          url: null,
        },
      ],
      hasPending: true,
    });
  });

  it('it returns object with empty array when no archives', async () => {
    mockListArchives.mockResolvedValue({
      headers: {
        'content-length': '28',
        'content-type': 'application/json; charset=utf-8',
      },
      status: 200,
      statusText: 'OK',
      data: {
        archives: [],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as AxiosResponse<any, any>);
    const archives = await getArchives('en', 'roomName');
    expect(archives).toEqual({
      archives: [],
      hasPending: false,
    });
  });

  it('it throws with error when api call throws', async () => {
    mockListArchives.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(getArchives('en', 'roomName')).rejects.toThrowError();
  });
});
