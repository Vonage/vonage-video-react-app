import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Subscriber } from '@vonage/client-sdk-video';
import useSubscriberTalking from '../useSubscriberTalking';

type AudioLevelHandler = (event: { audioLevel: number }) => void;

describe('useSubscriberTalking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not re-register the audioLevelUpdated listener when talking state toggles', () => {
    let audioLevelHandler: AudioLevelHandler | undefined;
    const on = vi.fn((event: string, handler: AudioLevelHandler) => {
      if (event === 'audioLevelUpdated') {
        audioLevelHandler = handler;
      }
    });
    const off = vi.fn();
    const subscriber = { on, off } as unknown as Subscriber;

    const { result } = renderHook(() =>
      useSubscriberTalking({ subscriber, isActiveSpeaker: true })
    );

    expect(on).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);

    // Drive the (stable) handler so it flips React talking state to true.
    act(() => {
      audioLevelHandler?.({ audioLevel: 1 });
    });
    act(() => {
      vi.advanceTimersByTime(200);
      audioLevelHandler?.({ audioLevel: 1 });
    });

    expect(result.current).toBe(true);

    // The listener must stay registered across the toggle — no off/on churn. Depending on
    // isTalking re-ran the effect and re-added the listener on every talking change.
    expect(on).toHaveBeenCalledTimes(1);
    expect(off).not.toHaveBeenCalled();
  });
});
