import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Subscriber } from '@vonage/client-sdk-video';
import { EventEmitter } from 'events';
import useReceivingCaptions from '../useReceivingCaptions';
import { SubscriberWrapper } from '../../types/session';
import useSessionContext from '../useSessionContext';
import { SessionContextType } from '../../Context/SessionProvider/session';

vi.mock('../useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
type TestSubscriber = Subscriber & EventEmitter;

describe('useReceivingCaptions', () => {
  let sessionContext: SessionContextType;

  const createSubscriberWrapper = (id: string): SubscriberWrapper => {
    const mockSubscriber = Object.assign(new EventEmitter(), {
      id,
      on: vi.fn((event, handler) => {
        EventEmitter.prototype.on.call(mockSubscriber, event, handler);
      }),
      off: vi.fn((event, handler) => {
        EventEmitter.prototype.off.call(mockSubscriber, event, handler);
      }),
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      stream: {
        streamId: id,
        name: 'Test User',
      },
    }) as unknown as TestSubscriber;

    return {
      id,
      element: document.createElement('video'),
      isScreenshare: false,
      isPinned: false,
      subscriber: mockSubscriber,
    };
  };
  beforeEach(() => {
    sessionContext = {
      subscriberWrappers: [],
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('should return initial empty values when no subscriber is provided', () => {
    const { result } = renderHook(() => useReceivingCaptions({ subscriber: undefined }));

    expect(result.current).toEqual({
      captionText: '',
      isReceivingCaptions: false,
    });
  });

  it('should subscribe to captionReceived events when there is a subscriber', () => {
    const mockSubscriber = createSubscriberWrapper('subscriber-1').subscriber;
    renderHook(() => useReceivingCaptions({ subscriber: mockSubscriber }));

    expect(mockSubscriber.on).toHaveBeenCalledTimes(1);
    expect(mockSubscriber.on).toHaveBeenCalledWith('captionReceived', expect.any(Function));
  });

  it('should unsubscribe from captionReceived events when the hook gets unmounted', () => {
    const mockSubscriber = createSubscriberWrapper('subscriber-1').subscriber;
    const { unmount } = renderHook(() => useReceivingCaptions({ subscriber: mockSubscriber }));

    unmount();

    expect(mockSubscriber.off).toHaveBeenCalledTimes(1);
    expect(mockSubscriber.off).toHaveBeenCalledWith('captionReceived', expect.any(Function));
  });

  it('should update captionText and isReceivingCaptions on captionReceived event', () => {
    const mockSubscriber = createSubscriberWrapper('subscriber-1').subscriber;

    const { result } = renderHook(() => useReceivingCaptions({ subscriber: mockSubscriber }));

    expect(result.current.captionText).toBe('');
    expect(result.current.isReceivingCaptions).toBe(false);

    act(() => {
      (mockSubscriber as unknown as EventEmitter).emit('captionReceived', {
        streamId: 'subscriber-1',
        caption: 'Test Caption',
        isFinal: true,
      });
    });

    expect(result.current.captionText).toBe('Test Caption');
    expect(result.current.isReceivingCaptions).toBe(true);
  });
});
