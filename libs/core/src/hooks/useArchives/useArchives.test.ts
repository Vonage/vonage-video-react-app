import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';

import runtime$ from '@core/stores/runtime';
import type { VideoClient } from '@core/services';
import useArchives from './useArchives';

type MockVideoClient = { searchArchives: { query: ReturnType<typeof vi.fn> } };

function createMockClient(overrides: Partial<MockVideoClient> = {}): VideoClient {
  return {
    searchArchives: {
      query: vi.fn().mockResolvedValue({ count: 0, items: [] }),
      ...overrides.searchArchives,
    },
  } as unknown as VideoClient;
}

function makeWrapper(videoClient: VideoClient) {
  const Provider = ({ children }: PropsWithChildren) =>
    runtime$.Provider({
      children,
      videoClient,
    });

  return { Wrapper: Provider };
}

describe('useArchives', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns archives when the request succeeds', async () => {
    const mockClient = createMockClient({
      searchArchives: {
        query: vi.fn().mockResolvedValue({
          count: 1,
          items: [{ id: 'archive-1', name: 'test' }],
        }),
      },
    });

    const { Wrapper } = makeWrapper(mockClient);

    const { result } = renderHook(
      () =>
        useArchives({
          sessionKey: 'room-1',
          queryOptions: { retry: false },
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        count: 1,
        items: [{ id: 'archive-1', name: 'test' }],
      });
    });

    expect(result.current.error).toBeNull();
    expect(
      (mockClient.searchArchives as unknown as MockVideoClient['searchArchives']).query
    ).toHaveBeenCalledWith({ sessionId: 'room-1', count: undefined, offset: undefined });
  });

  it('returns error when the request fails', async () => {
    const mockClient = createMockClient({
      searchArchives: {
        query: vi.fn().mockRejectedValue(new Error('request failed')),
      },
    });

    const { Wrapper } = makeWrapper(mockClient);

    const { result } = renderHook(
      () =>
        useArchives({
          sessionKey: 'room-1',
          queryOptions: { retry: false },
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.data).toBeUndefined();
  });

  it('uses empty filters when not provided', async () => {
    const mockClient = createMockClient();
    const { Wrapper } = makeWrapper(mockClient);

    renderHook(() => useArchives({}), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        (mockClient.searchArchives as unknown as MockVideoClient['searchArchives']).query
      ).toHaveBeenCalledWith({ sessionId: undefined, count: undefined, offset: undefined });
    });
  });

  it('exposes a refetch function', async () => {
    const mockClient = createMockClient();
    const { Wrapper } = makeWrapper(mockClient);

    const { result } = renderHook(
      () =>
        useArchives({
          sessionKey: 'room-1',
          queryOptions: { retry: false },
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
