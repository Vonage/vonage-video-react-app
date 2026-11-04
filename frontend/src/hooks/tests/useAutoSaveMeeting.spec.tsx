import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { meetingsService } from '@core/services';
import { installIndexedDbFake } from '@core-test/fixtures';
import { makeTestProvider, providers } from '@test/providers';
import useAutoSaveMeeting from '../useAutoSaveMeeting';

describe('useAutoSaveMeeting', () => {
  it('keeps the opened meeting once, and skips room names', async () => {
    expect.assertions(1);

    installIndexedDbFake();
    const sessionKey = 'header.payload.signature';

    renderHook(() => {
      useAutoSaveMeeting({ sessionKey, sessionKeyStatus: 'valid' });
      useAutoSaveMeeting({ sessionKey, sessionKeyStatus: 'valid' });
      useAutoSaveMeeting({ sessionKey: 'happy-hippo', sessionKeyStatus: 'legacy_hack' });
    });

    await waitFor(async () => {
      const meetings = await meetingsService.listMeetings();
      if (meetings.length === 0) throw new Error('Meeting not saved');
    });

    expect(await meetingsService.listMeetings()).toEqual([
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
