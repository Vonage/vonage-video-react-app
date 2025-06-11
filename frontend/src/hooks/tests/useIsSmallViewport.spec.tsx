import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import useIsSmallViewport from '../useIsSmallViewport';
import { SMALL_VIEWPORT } from '../../utils/constants';

const matchMediaCommon = {
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe('useIsSmallViewport', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: new RegExp(`\\(max-width:\\s*${SMALL_VIEWPORT + 1}px\\)`).test(query),
      media: query,
      ...matchMediaCommon,
    }));
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return false when window width is greater than 768px', () => {
    const { result } = renderHook(() => useIsSmallViewport());

    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than or equal to 768px', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: new RegExp(`\\(max-width:\\s*${SMALL_VIEWPORT}px\\)`).test(query),
      media: query,
      ...matchMediaCommon,
    }));
    const { result } = renderHook(() => useIsSmallViewport());

    expect(result.current).toBe(true);
  });
});
