import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useArchives from './useArchives';

describe('useArchives', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns archives when the request succeeds', async () => {
    const getArchives = vi.fn().mockResolvedValue({
      archives: [{ id: 'archive-1' }],
      hasPending: false,
    });

    const { result } = renderHook(() =>
      useArchives({
        getArchives,
        language: 'en',
        roomName: 'room-1',
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual([{ id: 'archive-1' }]);
    });

    expect(getArchives).toHaveBeenCalledWith({ language: 'en', roomName: 'room-1' });
  });

  it('returns error and forwards the error when the request fails', async () => {
    const requestError = new Error('request failed');
    const getArchives = vi.fn().mockRejectedValue(requestError);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useArchives({
        getArchives,
        language: 'en',
        onError,
        roomName: 'room-1',
      })
    );

    await waitFor(() => {
      expect(result.current).toBe('error');
    });

    expect(onError).toHaveBeenCalledWith(requestError);
  });

  it('polls while there are pending archives and stops after completion', async () => {
    const getArchives = vi
      .fn()
      .mockResolvedValueOnce({
        archives: [{ id: 'archive-1' }],
        hasPending: true,
      })
      .mockResolvedValueOnce({
        archives: [{ id: 'archive-1' }, { id: 'archive-2' }],
        hasPending: false,
      });

    const { result } = renderHook(() =>
      useArchives({
        getArchives,
        language: 'en',
        pollingIntervalInMilliseconds: 10,
        roomName: 'room-1',
      })
    );

    await waitFor(() => {
      expect(getArchives).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current).toEqual([{ id: 'archive-1' }, { id: 'archive-2' }]);
    });

    expect(getArchives).toHaveBeenCalledTimes(2);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(getArchives).toHaveBeenCalledTimes(2);
  });
});
