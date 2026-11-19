import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDebouncedValue from './';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by less than the delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // Fast-forward time to complete the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset the timer when value changes multiple times', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // First change
    rerender({ value: 'change1', delay: 500 });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Second change (should reset timer)
    rerender({ value: 'change2', delay: 500 });

    // Advance time by the original remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Complete the full delay from the second change
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('change2');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 1000 },
    });

    // Change value and delay
    rerender({ value: 'updated', delay: 200 });

    // Should use the new delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with different data types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    numberRerender({ value: 42, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(numberResult.current).toBe(42);

    // Test with object
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };

    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initialObj, delay: 100 } }
    );

    objectRerender({ value: updatedObj, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(objectResult.current).toBe(updatedObj);

    // Test with array
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];

    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initialArray, delay: 100 } }
    );

    arrayRerender({ value: updatedArray, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(arrayResult.current).toBe(updatedArray);
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    rerender({ value: 'updated', delay: 0 });

    // With zero delay, it should update on the next tick
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup timeouts on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change value to create a timeout
    rerender({ value: 'updated', delay: 500 });

    // Unmount before timeout completes
    unmount();

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should handle rapid successive changes correctly', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // Make multiple rapid changes
    rerender({ value: 'change1', delay: 500 });
    rerender({ value: 'change2', delay: 500 });
    rerender({ value: 'change3', delay: 500 });
    rerender({ value: 'final', delay: 500 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // After full delay, should show the final value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('final');
  });

  it('should work with boolean values', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: false, delay: 300 },
    });

    expect(result.current).toBe(false);

    rerender({ value: true, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(true);
  });

  it('should handle nullable values', () => {
    // Test with null initial value
    const { result: nullResult, rerender: nullRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: null as string | null, delay: 200 } }
    );

    expect(nullResult.current).toBeNull();

    nullRerender({ value: 'not null', delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(nullResult.current).toBe('not null');

    // Test with undefined initial value
    const { result: undefinedResult, rerender: undefinedRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: undefined as string | undefined, delay: 200 } }
    );

    expect(undefinedResult.current).toBeUndefined();

    undefinedRerender({ value: 'defined', delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(undefinedResult.current).toBe('defined');
  });
});
