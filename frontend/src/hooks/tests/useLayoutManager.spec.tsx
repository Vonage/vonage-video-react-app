import { describe, it, vi } from 'vitest';
import type * as OpentokLayout from 'opentok-layout-js';

const layoutContainer: OpentokLayout.LayoutContainer = {
  getLayout: vi.fn(),
  layout: vi.fn(),
  setOptions: vi.fn(),
};

vi.mock('opentok-layout-js', () => {
  const OpenTokLayoutManager = vi.fn(() => layoutContainer);

  return { __esModule: true, default: OpenTokLayoutManager, Box: vi.fn(), Element: vi.fn() };
});

import useLayoutManager from '../useLayoutManager';
import { renderHook } from '@testing-library/react';
import OpenTokLayoutManager from 'opentok-layout-js';

describe('useLayoutManager', () => {
  it('returns a memoized getLayout function that delegates to OpenTokLayoutManager', () => {
    const { result } = renderHook(() => useLayoutManager());

    const elements = [{}, {}] as OpentokLayout.Element[];
    const containerDimensions = { height: 600, width: 800 };
    const shouldMakeLargeTilesLandscape = false;

    const layout = result.current(containerDimensions, elements, shouldMakeLargeTilesLandscape);

    expect(layoutContainer.getLayout).toHaveBeenCalledWith(elements);
    expect(OpenTokLayoutManager).toHaveBeenCalledTimes(1);

    expect(OpenTokLayoutManager).toHaveBeenCalledWith(
      expect.objectContaining({
        bigMaxRatio: 3 / 2, // hard code ratio when shouldMakeLargeTilesLandscape is false
        containerWidth: containerDimensions.width,
        containerHeight: containerDimensions.height,
      })
    );

    // make sure there is a return value
    expect(layout).toBeDefined();
  });
});
