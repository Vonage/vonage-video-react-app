import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import throttle from './';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes leading call immediately, throttles rapid calls, fires trailing with latest args, then resets', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 500, { leading: true, trailing: true });

    // Leading call fires immediately with correct args
    throttled('a', 'b', 'c');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a', 'b', 'c');

    // Rapid calls within wait are suppressed; only latest args are kept for trailing
    throttled('second');
    throttled('third');
    expect(callback).toHaveBeenCalledTimes(1);

    // Trailing call fires after wait with the latest args
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('third');

    // After the full wait cycle the throttle resets — next call fires immediately again
    vi.advanceTimersByTime(500);
    throttled('reset');
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith('reset');

    // leading: false — first call must not fire until wait elapses
    const trailingOnly = throttle(callback, 500, { leading: false, trailing: true });
    trailingOnly('delayed');
    expect(callback).toHaveBeenCalledTimes(3);
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenLastCalledWith('delayed');

    // trailing: false — suppressed calls are never fired
    const leadingOnly = throttle(callback, 500, { leading: true, trailing: false });
    leadingOnly('lead');
    leadingOnly('ignored');
    expect(callback).toHaveBeenCalledTimes(5);
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(5);
  });
});
