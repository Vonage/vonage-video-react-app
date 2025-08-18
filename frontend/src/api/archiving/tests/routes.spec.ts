import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import axios from 'axios';
import { API_URL } from '../../../utils/constants';
import { startArchiving, stopArchiving, listArchives } from '../routes';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('archiving routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('startArchiving calls axios.post with correct URL and body', async () => {
    const mockResponse = { data: 'started' };
    (axios.post as Mock).mockResolvedValue(mockResponse);

    const roomName = 'room1';
    const tokenRole = 'admin';
    const result = await startArchiving(roomName, tokenRole);

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/session/${roomName}/startArchive`, {
      tokenRole,
    });
    expect(result).toBe(mockResponse);
  });

  it('stopArchiving calls axios.post with correct URL and body', async () => {
    const mockResponse = { data: 'stopped' };
    (axios.post as Mock).mockResolvedValue(mockResponse);

    const roomName = 'room2';
    const archiveId = 'archive123';
    const tokenRole = 'admin';
    const result = await stopArchiving(roomName, archiveId, tokenRole);

    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/session/${roomName}/${archiveId}/stopArchive`,
      {
        tokenRole,
      }
    );
    expect(result).toBe(mockResponse);
  });

  it('listArchives calls axios.post with correct URL', async () => {
    const mockResponse = { data: ['archive1', 'archive2'] };
    (axios.post as Mock).mockResolvedValue(mockResponse);

    const roomName = 'room3';
    const tokenRole = 'admin';
    const result = await listArchives(roomName, tokenRole);

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/session/${roomName}/archives`, {
      tokenRole,
    });
    expect(result).toBe(mockResponse);
  });
});
