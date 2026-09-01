import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import useElementDimensions from '../useElementDimensions';

describe('useElementDimensions', () => {
  let elementRef: RefObject<HTMLDivElement>;

  beforeEach(() => {
    elementRef = { current: document.createElement('div') };
    Object.defineProperty(elementRef.current, 'offsetWidth', {
      configurable: true,
      writable: true,
      value: 1,
    });

    Object.defineProperty(elementRef.current, 'offsetHeight', {
      configurable: true,
      writable: true,
      value: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initially returns dimensions as { width: 0, height: 0 }', () => {
    const { result } = renderHook(() => useElementDimensions({ elementRef }));
    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it('disconnects the ResizeObserver on unmount so it is not leaked', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(() => ({ observe, disconnect, unobserve: vi.fn() }))
    );

    const { unmount } = renderHook(() => useElementDimensions({ elementRef }));
    expect(observe).toHaveBeenCalledWith(elementRef.current);

    unmount();

    // The cleanup must disconnect the observer (release it), not merely unobserve one element.
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
