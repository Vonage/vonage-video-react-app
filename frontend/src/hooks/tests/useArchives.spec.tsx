import { renderHook, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, expect, it, Mock } from 'vitest';
import { useLocation } from 'react-router-dom';
import useArchives from '../useArchives';
import { getArchives } from '../../api/archiving';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

vi.mock('../../api/archiving', () => ({
  getArchives: vi.fn(),
}));

const mockGetArchives = getArchives as Mock<[], ReturnType<typeof getArchives>>;

describe('useArchives', () => {
  beforeEach(() => {
    (useLocation as Mock).mockReturnValue({
      search: '?tokenRole=admin',
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns archives', async () => {
    mockGetArchives.mockResolvedValue({
      archives: [
        {
          id: '1',
          url: 'https://example.com/archive1',
          status: 'available',
          createdAt: 1723425600000, // August 12, 2024, 12:00:00 UTC in milliseconds
          createdAtFormatted: 'August 12, 2024, 12:00 PM',
        },
        {
          id: '2',
          url: 'https://example.com/archive2',
          status: 'available',
          createdAt: 1723432800000, // August 12, 2024, 14:00:00 UTC in milliseconds
          createdAtFormatted: 'August 12, 2024, 2:00 PM',
        },
      ],
      hasPending: false,
    });
    const { result } = renderHook(() => useArchives({ roomName: 'room1' }));

    // Wait for the async effect (fetchArchives) to finish and state to update
    await act(async () => {});

    expect(result.current).toEqual([
      {
        id: '1',
        url: 'https://example.com/archive1',
        status: 'available',
        createdAt: 1723425600000, // August 12, 2024, 12:00:00 UTC in milliseconds
        createdAtFormatted: 'August 12, 2024, 12:00 PM',
      },
      {
        id: '2',
        url: 'https://example.com/archive2',
        status: 'available',
        createdAt: 1723432800000, // August 12, 2024, 14:00:00 UTC in milliseconds
        createdAtFormatted: 'August 12, 2024, 2:00 PM',
      },
    ]);
    expect(mockGetArchives).toHaveBeenCalledWith('room1', 'admin');
  });

  it('sets error state when API throws', async () => {
    mockGetArchives.mockRejectedValue(new Error('network fail'));

    const { result } = renderHook(() => useArchives({ roomName: 'room1' }));

    // Wait for the async effect (fetchArchives) to finish and state to update
    await act(async () => {});

    expect(result.current).toBe('error');
  });
});
