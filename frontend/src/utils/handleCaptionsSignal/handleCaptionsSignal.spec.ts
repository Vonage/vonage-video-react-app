import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RefObject } from 'react';
import handleCaptionsSignal from './handleCaptionsSignal';
import { SignalEvent } from '../../types/session';
import { disableCaptions } from '../../api/captions';

vi.mock('../../api/captions', () => ({
  disableCaptions: vi.fn(),
}));
const mockCaptionsId = '12345';

describe('handleCaptionsSignal', () => {
  let currentCaptionsIdRef: RefObject<string | null>;
  let captionsActiveCountRef: RefObject<number>;
  let vonageVideoClientSignal: ReturnType<typeof vi.fn>;

  const currentRoomName: string = 'test-room';
  const setCaptionsEnabled = vi.fn();

  beforeEach(() => {
    vonageVideoClientSignal = vi.fn();
  });

  it('should enable captions', () => {
    currentCaptionsIdRef = { current: null };
    captionsActiveCountRef = { current: 0 };

    const event = {
      data: JSON.stringify({
        action: 'enable',
        captionsId: mockCaptionsId,
        currentCount: 1,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(currentCaptionsIdRef.current).toBe(mockCaptionsId);
    expect(vonageVideoClientSignal).toHaveBeenCalledWith({
      type: 'captions',
      data: JSON.stringify({
        action: 'update-current-user-count',
        currentCount: 1,
      }),
    });
  });

  it('should disable captions', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 1 };

    const event = {
      data: JSON.stringify({
        action: 'disable',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(currentCaptionsIdRef.current).toBeNull();
    expect(captionsActiveCountRef.current).toBe(0);
  });

  it('should increase the number of active captions user when joining the captions', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 2 };

    const event = {
      data: JSON.stringify({
        action: 'join',
        captionsId: mockCaptionsId,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(captionsActiveCountRef.current).toBe(3);
  });

  it('should signal out the new number of captions users when one leaves the captions', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 3 };
    const event = {
      data: JSON.stringify({
        action: 'leave',
        captionsId: mockCaptionsId,
      }),
    } as unknown as SignalEvent;
    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(vonageVideoClientSignal).toHaveBeenCalledWith({
      type: 'captions',
      data: JSON.stringify({
        action: 'update-current-user-count',
        currentCount: 2,
      }),
    });
  });

  it('should update current user count', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 1 };
    const event = {
      data: JSON.stringify({
        action: 'update-current-user-count',
        currentCount: 2,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(captionsActiveCountRef.current).toBe(2);
  });

  it('should disable captions when the last user leaves', async () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 1 };
    const event = {
      data: JSON.stringify({
        action: 'leave',
        captionsId: mockCaptionsId,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(disableCaptions).toHaveBeenCalledWith('test-room', mockCaptionsId);
  });

  it('should send out the current captions when there is a request for it', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 1 };
    const event = {
      data: JSON.stringify({
        action: 'request-status',
        captionsId: mockCaptionsId,
        currentCount: 1,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(vonageVideoClientSignal).toHaveBeenCalledWith({
      type: 'captions',
      data: JSON.stringify({
        action: 'status-response',
        captionsId: mockCaptionsId,
        currentCount: 1,
      }),
    });
  });

  it('should set the captions ID and count when receiving a status response', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };
    captionsActiveCountRef = { current: 2 };
    const event = {
      data: JSON.stringify({
        action: 'status-response',
        captionsId: mockCaptionsId,
        currentCount: 1,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(currentCaptionsIdRef.current).toBe(mockCaptionsId);
    expect(captionsActiveCountRef.current).toBe(2);
  });

  it('should warn for unknown actions', () => {
    currentCaptionsIdRef = { current: null };
    captionsActiveCountRef = { current: 0 };
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const event = {
      data: JSON.stringify({
        action: 'unknown-action',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      captionsActiveCountRef,
      currentRoomName,
      vonageVideoClientSignal,
      setCaptionsEnabled,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown captions action: unknown-action');
  });
});
