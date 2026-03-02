import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAccumulator from './';

describe('useAccumulator', () => {
  it('should create an initial value using the callback', () => {
    const callback = vi.fn((prev: number | undefined) => (prev ?? 0) + 1);
    const { result } = renderHook(() => useAccumulator(callback, []));

    expect(result.current.current).toBe(1);
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  it('should accumulate values when dependencies change', () => {
    const callback = vi.fn((prev: number | undefined) => (prev ?? 0) + 1);
    const { result, rerender } = renderHook(({ dep }) => useAccumulator(callback, [dep]), {
      initialProps: { dep: 1 },
    });

    expect(result.current.current).toBe(1);

    rerender({ dep: 2 });
    expect(result.current.current).toBe(2);

    rerender({ dep: 3 });
    expect(result.current.current).toBe(3);
  });

  it('should not recreate value when dependencies do not change', () => {
    const callback = vi.fn((prev: number | undefined) => (prev ?? 0) + 1);
    const { result, rerender } = renderHook(() => useAccumulator(callback, []));

    const firstValue = result.current.current;
    rerender();
    const secondValue = result.current.current;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(firstValue).toBe(secondValue);
  });

  it('should pass previous value to callback', () => {
    const callback = vi.fn((prev: string | undefined) => {
      return prev ? `${prev}-next` : 'first';
    });

    const { result, rerender } = renderHook(({ dep }) => useAccumulator(callback, [dep]), {
      initialProps: { dep: 1 },
    });

    expect(result.current.current).toBe('first');
    expect(callback).toHaveBeenCalledWith(undefined);

    rerender({ dep: 2 });
    expect(result.current.current).toBe('first-next');
    expect(callback).toHaveBeenLastCalledWith('first');

    rerender({ dep: 3 });
    expect(result.current.current).toBe('first-next-next');
    expect(callback).toHaveBeenLastCalledWith('first-next');
  });

  it('should work with complex objects', () => {
    type State = { count: number; items: string[] };

    const callback = (prev: State | undefined): State => {
      if (!prev) {
        return { count: 0, items: [] };
      }
      return {
        count: prev.count + 1,
        items: [...prev.items, `item-${prev.count}`],
      };
    };

    const { result, rerender } = renderHook(({ dep }) => useAccumulator(callback, [dep]), {
      initialProps: { dep: 1 },
    });

    expect(result.current.current).toEqual({ count: 0, items: [] });

    rerender({ dep: 2 });
    expect(result.current.current).toEqual({ count: 1, items: ['item-0'] });

    rerender({ dep: 3 });
    expect(result.current.current).toEqual({ count: 2, items: ['item-0', 'item-1'] });
  });

  it('should maintain stable ref object across rerenders', () => {
    const callback = (prev: number | undefined) => (prev ?? 0) + 1;
    const { result, rerender } = renderHook(({ dep }) => useAccumulator(callback, [dep]), {
      initialProps: { dep: 1 },
    });

    const firstRef = result.current;
    rerender({ dep: 2 });
    const secondRef = result.current;

    expect(firstRef).toBe(secondRef);
  });

  it('should handle array accumulation', () => {
    const callback = (prev: number[] | undefined) => {
      if (!prev) return [1];
      return [...prev, prev.length + 1];
    };

    const { result, rerender } = renderHook(({ dep }) => useAccumulator(callback, [dep]), {
      initialProps: { dep: 1 },
    });

    expect(result.current.current).toEqual([1]);

    rerender({ dep: 2 });
    expect(result.current.current).toEqual([1, 2]);

    rerender({ dep: 3 });
    expect(result.current.current).toEqual([1, 2, 3]);
  });
});
