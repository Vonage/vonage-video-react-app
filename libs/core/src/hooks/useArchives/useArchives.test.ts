import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTestProvider, providers, ProviderOptions } from '@core-test/providers';
import useArchives from './useArchives';
import { makeVideoClientMock } from '@core-test/fixtures';
import { SingleArchiveResponse } from '@vonage/video';

const singleArchiveResponse = {
  id: 'archive-1',
  name: 'test',
} as SingleArchiveResponse;

describe('useArchives', () => {
  it('returns archives when the request succeeds', async () => {
    expect.assertions(4);

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({
        count: 1,
        items: [singleArchiveResponse],
      }),
    });

    const { result } = renderHook(
      () =>
        useArchives({
          sessionKey: 'room-1',
          queryOptions: { retry: false },
        }),
      {
        runtimeContext: {
          videoClient,
        },
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      if (!result.current.data) {
        throw new Error('No data');
      }
    });

    expect(result.current.data).toEqual({
      count: 1,
      items: [{ id: 'archive-1', name: 'test' }],
    });

    expect(result.current.error).toBeNull();

    expect(videoClient.searchArchives).toHaveBeenCalledWith({
      sessionKey: 'room-1',
      count: undefined,
      offset: undefined,
    });
  });

  it('returns error when the request fails', async () => {
    expect.assertions(3);

    const error = new Error('Failed to fetch archives');

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.reject(error),
    });

    const { result } = renderHook(
      () =>
        useArchives({
          sessionKey: 'room-1',
          queryOptions: { retry: false },
        }),
      {
        runtimeContext: {
          videoClient,
        },
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      if (!result.current.error) {
        throw new Error('No error');
      }
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();
  });
});

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook<Result>(render: () => Result, { runtimeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime], {
    runtimeContext,
  });

  return {
    ...context,
    ...renderHookBase(render, {
      wrapper,
    }),
  };
}
