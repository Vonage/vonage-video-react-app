import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useAttemptSignatureGuard from '../useAttemptSignatureGuard';

describe('useAttemptSignatureGuard', () => {
  it('allows the first attempt of a signature and refuses an immediate repeat', () => {
    const { result } = renderHook(() => useAttemptSignatureGuard());

    expect(result.current.shouldAttempt('mic|cam')).toBe(true);
    // Same signature again (the identical request that just failed) is refused — this is what stops
    // Safari's endless getUserMedia re-prompt loop.
    expect(result.current.shouldAttempt('mic|cam')).toBe(false);
  });

  it('allows a genuinely different signature', () => {
    const { result } = renderHook(() => useAttemptSignatureGuard());

    expect(result.current.shouldAttempt('mic|cam')).toBe(true);
    // A different requested-source set (e.g. the reduced video-only retry) has a new signature.
    expect(result.current.shouldAttempt('false|cam')).toBe(true);
  });

  it('re-arms after reset so the same signature is allowed again', () => {
    const { result } = renderHook(() => useAttemptSignatureGuard());

    expect(result.current.shouldAttempt('mic|cam')).toBe(true);
    expect(result.current.shouldAttempt('mic|cam')).toBe(false);

    act(() => {
      result.current.reset();
    });

    expect(result.current.shouldAttempt('mic|cam')).toBe(true);
  });

  it('keeps a stable API identity across renders (safe for effect dependency arrays)', () => {
    const { result, rerender } = renderHook(() => useAttemptSignatureGuard());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
