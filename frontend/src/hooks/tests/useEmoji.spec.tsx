import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { EventEmitter } from 'events';
import { Connection } from '@vonage/client-sdk-video';
import { MutableRefObject } from 'react';
import useSessionContext from '../useSessionContext';
import { SessionContextType } from '../../Context/SessionProvider/session';
import useEmoji, { EmojiWrapper } from '../useEmoji';
import VonageVideoClient from '../../utils/VonageVideoClient';

vi.mock('../useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('useEmoji', () => {
  let vonageVideoClient: MutableRefObject<VonageVideoClient | null>;
  let mockConnection: Connection;
  let mockSubscriberWrapperVideo: {
    subscriber: { stream: { connection: Connection; name: string } };
    isScreenshare: boolean;
  };
  let mockSubscriberWrapperScreen: {
    subscriber: {
      stream: {
        connection: Connection;
        name: string;
      };
    };
    isScreenshare: boolean;
  };

  beforeEach(() => {
    // Create an EventEmitter to simulate the session
    vonageVideoClient = {
      current: Object.assign(new EventEmitter(), {
        signal: vi.fn(),
        connectionId: 'connection-id',
      }) as unknown as VonageVideoClient,
    };

    mockConnection = { connectionId: '456' } as Connection;

    mockSubscriberWrapperVideo = {
      subscriber: {
        stream: {
          connection: mockConnection,
          name: 'John Doe',
        },
      },
      isScreenshare: false,
    };

    mockSubscriberWrapperScreen = {
      subscriber: {
        stream: {
          connection: mockConnection,
          name: `John Doe's screen`,
        },
      },
      isScreenshare: true,
    };

    const mockSessionContext = {
      session: vonageVideoClient,
      subscriberWrappers: [mockSubscriberWrapperVideo, mockSubscriberWrapperScreen],
    } as unknown as SessionContextType;

    mockUseSessionContext.mockImplementation(() => mockSessionContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('sendEmoji', () => {
    it('calls Session.signal with the emoji and current time', async () => {
      vi.setSystemTime(12_000_000);
      const { result } = renderHook(() => useEmoji({ vonageVideoClient }));

      act(() => {
        result.current.sendEmoji('❤️');
      });

      expect(vonageVideoClient.current?.signal).toBeCalledTimes(1);
      expect(vonageVideoClient.current?.signal).toBeCalledWith(
        {
          type: 'emoji',
          data: '{"emoji":"❤️","time":12000000}',
        },
        expect.any(Function)
      );
    });

    it('when called multiple times, sendEmoji throttles calls to once every 500ms', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useEmoji({ vonageVideoClient }));

      act(() => {
        result.current.sendEmoji('❤️');
        result.current.sendEmoji('❤️');
      });

      expect(vonageVideoClient.current?.signal).toBeCalledTimes(1);

      vi.advanceTimersByTime(250);
      expect(vonageVideoClient.current?.signal).toBeCalledTimes(1);

      vi.advanceTimersByTime(251);
      act(() => {
        result.current.sendEmoji('❤️');
      });
      expect(vonageVideoClient.current?.signal).toBeCalledTimes(2);
    });
  });

  it('adds emojis to the queue when a signal event is received and gets the correct sender name', async () => {
    const { result } = renderHook(() => useEmoji({ vonageVideoClient }));

    act(() => {
      // Simulate sending an emoji
      result.current.sendEmoji('❤️');
    });

    // Mock emitting a signal event from another user's connection
    act(() => {
      vonageVideoClient.current?.emit('signal', {
        type: 'signal:emoji',
        data: JSON.stringify({
          emoji: '❤️',
          time: Date.now(),
          connectionId: mockConnection.connectionId, // Different from the session connection
        }),
        from: { connectionId: '456', creationTime: 1, data: 'some-data' },
      });
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
});
