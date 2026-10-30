import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { notifications$ } from '@core/stores';
import frontendLogger from '../../../logger';
import useResubscribeFailureNotifier, {
  CONNECTION_ISSUES_NOTIFICATION_MS,
} from './useResubscribeFailureNotifier';

const mockLoggerProvider = { log: vi.fn(), reportError: vi.fn() };
frontendLogger.setup(() => mockLoggerProvider);

const streamNotFoundError = { name: 'OT_STREAM_NOT_FOUND', message: 'stream not found' };

describe('useResubscribeFailureNotifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows one notification for a burst of failures and reports each failed stream', async () => {
    expect.assertions(4);
    const pushSpy = vi.spyOn(notifications$.actions, 'push');
    const { result } = renderHook(() => useResubscribeFailureNotifier());

    await act(async () => {
      ['stream-1', 'stream-2', 'stream-3', 'stream-4'].forEach((streamId) => {
        result.current.resubscribeFailureNotifier({ streamId, error: streamNotFoundError });
      });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'warning',
        message: "Connection issues. Some video couldn't be restored.",
      })
    );
    expect(mockLoggerProvider.reportError).toHaveBeenCalledTimes(4);
    expect(mockLoggerProvider.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'OT_STREAM_NOT_FOUND' }),
      expect.objectContaining({ eventSource: 'session.resubscribeFailed', streamId: 'stream-4' })
    );
  });

  it('shows a new notification for a failure after the previous notification expired', async () => {
    expect.assertions(1);
    const pushSpy = vi.spyOn(notifications$.actions, 'push');
    const { result } = renderHook(() => useResubscribeFailureNotifier());

    act(() => {
      result.current.resubscribeFailureNotifier({
        streamId: 'stream-1',
        error: streamNotFoundError,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(CONNECTION_ISSUES_NOTIFICATION_MS);
    });
    act(() => {
      result.current.resubscribeFailureNotifier({
        streamId: 'stream-1',
        error: streamNotFoundError,
      });
    });

    expect(pushSpy).toHaveBeenCalledTimes(2);
  });
});
