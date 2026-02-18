import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useStableRef from './';

describe('useStableRef', () => {
  describe('Simple ref (value only)', () => {
    it('should create a ref with the initial value', () => {
      const { result } = renderHook(() => useStableRef(42));
      expect(result.current.current).toBe(42);
    });

    it('should update ref.current on each render', () => {
      const { result, rerender } = renderHook(({ value }) => useStableRef(value), {
        initialProps: { value: 1 },
      });

      expect(result.current.current).toBe(1);

      rerender({ value: 2 });
      expect(result.current.current).toBe(2);

      rerender({ value: 3 });
      expect(result.current.current).toBe(3);
    });

    it('should maintain the same ref object across renders', () => {
      const { result, rerender } = renderHook(({ value }) => useStableRef(value), {
        initialProps: { value: 'initial' },
      });

      const firstRef = result.current;
      rerender({ value: 'updated' });
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });
  });

  describe('Non-disposable stable ref (builder with deps)', () => {
    it('should call builder on first render', () => {
      const builder = vi.fn(() => ({ data: 'test' }));
      const { result } = renderHook(() => useStableRef(builder, []));

      expect(builder).toHaveBeenCalledTimes(1);
      expect(result.current.current).toEqual({ data: 'test' });
    });

    it("should not recreate value when dependencies don't change", () => {
      const builder = vi.fn(() => ({ data: 'test' }));
      const { result, rerender } = renderHook(() => useStableRef(builder, []));

      const firstValue = result.current.current;
      rerender();
      const secondValue = result.current.current;

      expect(builder).toHaveBeenCalledTimes(1);
      expect(firstValue).toBe(secondValue);
    });

    it('should recreate value when dependencies change', () => {
      const builder = vi.fn((count: number) => ({ count }));
      const { result, rerender } = renderHook(
        ({ dep }) => useStableRef(() => builder(dep), [dep]),
        { initialProps: { dep: 1 } }
      );

      expect(result.current.current).toEqual({ count: 1 });
      expect(builder).toHaveBeenCalledTimes(1);

      rerender({ dep: 2 });
      expect(result.current.current).toEqual({ count: 2 });
      expect(builder).toHaveBeenCalledTimes(2);
    });

    it('should maintain same ref object across dependency changes', () => {
      const builder = vi.fn((n: number) => n * 2);
      const { result, rerender } = renderHook(
        ({ dep }) => useStableRef(() => builder(dep), [dep]),
        { initialProps: { dep: 1 } }
      );

      const firstRef = result.current;
      rerender({ dep: 2 });
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });
  });

  describe('Disposable stable ref (builder with cleanup and deps)', () => {
    it('should call builder after mount', () => {
      const builder = vi.fn(() => ({ resource: 'created' }));
      const cleanup = vi.fn();

      const { result } = renderHook(() => useStableRef(builder, cleanup, []));

      expect(builder).toHaveBeenCalledTimes(1);
      expect(result.current.current).toEqual({ resource: 'created' });
    });

    it('should throw error when accessing ref during render phase', () => {
      const builder = vi.fn(() => ({ data: 'test' }));
      const cleanup = vi.fn();

      expect(() => {
        renderHook(() => {
          const ref = useStableRef(builder, cleanup, []);
          // Trying to access during render
          return ref.current;
        });
      }).toThrow('Stable ref is not available during render phase.');
    });

    it('should call cleanup when dependencies change', () => {
      const builder = vi.fn((id: number) => ({ id }));
      const cleanup = vi.fn();

      const { rerender } = renderHook(
        ({ dep }) => useStableRef(() => builder(dep), cleanup, [dep]),
        { initialProps: { dep: 1 } }
      );

      expect(cleanup).not.toHaveBeenCalled();

      rerender({ dep: 2 });
      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalledWith({ id: 1 });
    });

    it('should call cleanup on unmount', () => {
      const builder = vi.fn(() => ({ resource: 'test' }));
      const cleanup = vi.fn();

      const { unmount } = renderHook(() => useStableRef(builder, cleanup, []));

      unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalledWith({ resource: 'test' });
    });

    it('should rebuild resource after dependency change', () => {
      const builder = vi.fn((id: number) => ({ id, name: `resource-${id}` }));
      const cleanup = vi.fn();

      const { result, rerender } = renderHook(
        ({ dep }) => useStableRef(() => builder(dep), cleanup, [dep]),
        { initialProps: { dep: 1 } }
      );

      expect(result.current.current).toEqual({ id: 1, name: 'resource-1' });

      rerender({ dep: 2 });
      expect(builder).toHaveBeenCalledTimes(2);
      expect(result.current.current).toEqual({ id: 2, name: 'resource-2' });
    });

    it('should not recreate resource when dependencies stay the same', () => {
      const builder = vi.fn(() => ({ data: 'test' }));
      const cleanup = vi.fn();

      const { result, rerender } = renderHook(() => useStableRef(builder, cleanup, []));

      const firstValue = result.current.current;
      rerender();
      const secondValue = result.current.current;

      expect(builder).toHaveBeenCalledTimes(1);
      expect(cleanup).not.toHaveBeenCalled();
      expect(firstValue).toBe(secondValue);
    });
  });
});
