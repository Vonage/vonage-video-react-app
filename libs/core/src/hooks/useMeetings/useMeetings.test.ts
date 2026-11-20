import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SessionKey } from '@common/types';
import { makeTestProvider, providers } from '@core-test/providers';
import { installIndexedDbFake } from '@core-test/fixtures';
import useSaveMeeting from '../useSaveMeeting';
import useMeetings from './useMeetings';

describe('useMeetings', () => {
  it('lists a meeting as soon as it is saved', async () => {
    expect.assertions(2);

    installIndexedDbFake();
    const sessionKey = 'header.payload.signature' as SessionKey;

    const { result } = renderHook(() => ({
      meetings: useMeetings(),
      saveMeeting: useSaveMeeting(),
    }));

    await waitFor(() => {
      if (!result.current.meetings.isSuccess) throw new Error('Meetings not loaded');
    });

    expect(result.current.meetings.data).toEqual([]);

    await act(() => result.current.saveMeeting.mutateAsync({ sessionKey }));

    await waitFor(() => {
      if (result.current.meetings.data?.length !== 1) throw new Error('Meeting not listed');
    });

    expect(result.current.meetings.data).toEqual([
      expect.objectContaining({ sessionKey, archivedAt: null }),
    ]);
  });
});

function renderHook<Result>(render: () => Result) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime]);

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
