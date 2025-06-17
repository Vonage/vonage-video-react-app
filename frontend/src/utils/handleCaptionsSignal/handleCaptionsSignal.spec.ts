import { describe, expect, it, vi } from 'vitest';
import { RefObject } from 'react';
import handleCaptionsSignal from './handleCaptionsSignal';
import { SignalEvent } from '../../types/session';

vi.mock('../../api/captions', () => ({
  disableCaptions: vi.fn(),
}));
const mockCaptionsId = '12345';

describe('handleCaptionsSignal', () => {
  let currentCaptionsIdRef: RefObject<string | null>;
  const setIsCaptioningEnabled = vi.fn();

  it('should enable captions', () => {
    currentCaptionsIdRef = { current: null };

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
      setIsCaptioningEnabled,
    });

    expect(currentCaptionsIdRef.current).toBe(mockCaptionsId);
  });

  it('should disable captions', () => {
    currentCaptionsIdRef = { current: mockCaptionsId };

    const event = {
      data: JSON.stringify({
        action: 'disable',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      setIsCaptioningEnabled,
    });

    expect(currentCaptionsIdRef.current).toBeNull();
  });

  it('should warn for unknown actions', () => {
    currentCaptionsIdRef = { current: null };
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const event = {
      data: JSON.stringify({
        action: 'unknown-action',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      currentCaptionsIdRef,
      setIsCaptioningEnabled,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown captions action: unknown-action');
  });
});
