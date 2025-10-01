import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import useIsTabletViewport from '../useIsTabletViewport';
import { TABLET_VIEWPORT } from '../../utils/constants';

const matchMediaCommon = {
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe('useIsTabletViewport', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: new RegExp(`\\(max-width:\\s*${TABLET_VIEWPORT + 1}px\\)`).test(query),
      media: query,
      ...matchMediaCommon,
    }));
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return false when window width is greater than 899px', () => {
    const { result } = renderHook(() => useIsTabletViewport());

    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than or equal to 899px', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: new RegExp(`\\(max-width:\\s*${TABLET_VIEWPORT}px\\)`).test(query),
      media: query,
      ...matchMediaCommon,
    }));
    const { result } = renderHook(() => useIsTabletViewport());

    expect(result.current).toBe(true);
  });
});
