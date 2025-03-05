import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useShownButtons from '../useShownButtons';

const viewportsToTest = [
  {
    innerWidth: 360,
    expectedShownButtons: 0,
  },
  {
    innerWidth: 414,
    expectedShownButtons: 1,
  },
  {
    innerWidth: 474,
    expectedShownButtons: 2,
  },
  {
    innerWidth: 534,
    expectedShownButtons: 3,
  },
  {
    innerWidth: 594,
    expectedShownButtons: 4,
  },
  {
    innerWidth: 666,
    expectedShownButtons: 5,
  },
  {
    innerWidth: 726,
    expectedShownButtons: 6,
  },
  {
    innerWidth: 786,
    expectedShownButtons: 7,
  },
];

describe('useShownButtons', () => {
  beforeEach(() => {
    vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(360);
    global.dispatchEvent(new Event('resize'));
  });

  describe('for initial window width', () => {
    viewportsToTest.forEach((viewportToTest) => {
      it(`should return ${viewportToTest.expectedShownButtons} buttons when width is ${viewportToTest.innerWidth}`, () => {
        vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(viewportToTest.innerWidth);
        const { result } = renderHook(() => useShownButtons());

        expect(result.current).toBe(viewportToTest.expectedShownButtons);
      });
    });
  });

  describe('after resizing window width', () => {
    viewportsToTest.forEach((viewportToTest) => {
      it(`should return ${viewportToTest.expectedShownButtons} buttons when width is ${viewportToTest.innerWidth}`, () => {
        act(() => {
          vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(viewportToTest.innerWidth);
          global.dispatchEvent(new Event('resize'));
        });
        const { result } = renderHook(() => useShownButtons());
        expect(result.current).toBe(viewportToTest.expectedShownButtons);
      });
    });
  });
});
