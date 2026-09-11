import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useStableCallback from './';

describe('useStableCallback', () => {
  it('should return a stable callback reference', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useStableCallback(callback));

    const firstCallback = result.current;
    rerender();

    expect(result.current).toBe(firstCallback);
  });

  it('should call the latest version of the callback', () => {
    const { result, rerender } = renderHook(({ value }) => useStableCallback(() => value), {
      initialProps: { value: 'first' },
    });

    expect(result.current()).toBe('first');

    rerender({ value: 'second' });
    expect(result.current()).toBe('second');
  });
});
