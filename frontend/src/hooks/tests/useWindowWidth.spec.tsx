import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useWindowWidth from '../useWindowWidth';

describe('useWindowWidth', () => {
  const nativeWindowInnerWidth = window.innerWidth;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: nativeWindowInnerWidth,
    });
  });

  it('should return the initial state', () => {
    const { result } = renderHook(() => useWindowWidth());

    expect(result.current).toBe(1024);
  });

  it('should update value on window resize', () => {
    const newWidth = 768;
    const { result } = renderHook(() => useWindowWidth());

    act(() => {
      window.innerWidth = newWidth;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(newWidth);
  });
});
