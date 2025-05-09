import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Connection } from '@vonage/client-sdk-video';
import useEmoji, { EmojiWrapper } from '../useEmoji';
import { SignalEvent, SubscriberWrapper } from '../../types/session';

const mockSignal = vi.fn();
const mockGetConnectionId = vi.fn();
const mockConnection = { connectionId: '456' } as Connection;

describe('useEmoji', () => {
  beforeEach(() => {
    mockGetConnectionId.mockReturnValue('123');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('sendEmoji', () => {
    it('calls Session.signal with the emoji and current time', async () => {
      vi.setSystemTime(12_000_000);
      const { result } = renderHook(() =>
        useEmoji({ signal: mockSignal, getConnectionId: mockGetConnectionId })
      );

      act(() => {
        result.current.sendEmoji('❤️');
      });

      expect(mockSignal).toBeCalledTimes(1);
      expect(mockSignal).toBeCalledWith({
        type: 'emoji',
        data: '{"emoji":"❤️","time":12000000}',
      });
    });

    it('when called multiple times, sendEmoji throttles calls to once every 500ms', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() =>
        useEmoji({ signal: mockSignal, getConnectionId: mockGetConnectionId })
      );

      act(() => {
        result.current.sendEmoji('❤️');
        result.current.sendEmoji('❤️');
      });

      expect(mockSignal).toBeCalledTimes(1);

      vi.advanceTimersByTime(250);
      expect(mockSignal).toBeCalledTimes(1);

      vi.advanceTimersByTime(251);
      act(() => {
        result.current.sendEmoji('❤️');
      });
      expect(mockSignal).toBeCalledTimes(2);
    });
  });

  it('adds emojis to the queue when a signal event is received and gets the correct sender name', async () => {
    const { result } = renderHook(() =>
      useEmoji({ signal: mockSignal, getConnectionId: mockGetConnectionId })
    );

    // Mock receiving a signal event from another user
    act(() => {
      const signalEvent: SignalEvent = {
        type: 'signal:emoji',
        data: JSON.stringify({
          emoji: '❤️',
          time: Date.now(),
          connectionId: mockConnection.connectionId, // Different from the session connection
        }) as unknown as string,
        from: { connectionId: '456', creationTime: 1, data: 'some-data' },
      };
      const subscriberWrapper: SubscriberWrapper = {
        subscriber: {
          stream: {
            connection: {
              connectionId: '456',
            },
            name: 'John Doe',
          },
        },
      } as unknown as SubscriberWrapper;
      const subscriberWrappers = [subscriberWrapper];
      result.current.onEmoji(signalEvent, subscriberWrappers);
    });

    const expectedEmojiWrapper: EmojiWrapper = {
      name: 'John Doe', // The mock connection user
      emoji: '❤️',
      time: expect.any(Number),
    };

    // Use waitFor to check if emojiQueue contains the expected emoji
    await waitFor(() => {
      expect(result.current.emojiQueue).toContainEqual(expectedEmojiWrapper);
    });
  });

  it('recognizes when a received signal event is from local user', async () => {
    const { result } = renderHook(() =>
      useEmoji({ signal: mockSignal, getConnectionId: mockGetConnectionId })
    );

    // Mock receiving a signal event from local user
    act(() => {
      const signalEvent: SignalEvent = {
        type: 'signal:emoji',
        data: JSON.stringify({
          emoji: '😲',
          time: Date.now(),
          connectionId: mockConnection.connectionId, // Different from the session connection
        }) as unknown as string,
        from: { connectionId: '123', creationTime: 1, data: 'some-data' },
      };
      const subscriberWrapper: SubscriberWrapper = {
        subscriber: {
          stream: {
            connection: {
              connectionId: '123',
            },
            name: 'That be I',
          },
        },
      } as unknown as SubscriberWrapper;
      const subscriberWrappers = [subscriberWrapper];
      result.current.onEmoji(signalEvent, subscriberWrappers);
    });

    const expectedEmojiWrapper: EmojiWrapper = {
      name: 'You',
      emoji: '😲',
      time: expect.any(Number),
    };

    // Use waitFor to check if emojiQueue contains the expected emoji
    await waitFor(() => {
      expect(result.current.emojiQueue).toContainEqual(expectedEmojiWrapper);
    });
  });
});
