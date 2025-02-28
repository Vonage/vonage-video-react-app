// import OpenTokLayoutManager, { Box, Element, LayoutContainer } from 'opentok-layout-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LayoutManager from './layoutManager';

const { mockGetLayout, mockConstructor } = vi.hoisted(() => {
  const getLayout = vi.fn();
  const constructor = vi.fn().mockReturnValue({
    getLayout,
  });
  return { mockGetLayout: getLayout, mockConstructor: constructor };
});

vi.mock('opentok-layout-js', () => ({
  default: mockConstructor,
}));

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;
  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  it('should create a new layout manager with options', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], false);
    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        containerWidth: 100,
        containerHeight: 150,
      })
    );
  });

  it('should set bigMaxRatio to 9 / 16 if fixLargeTilesLandscape flag is true', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], true);
    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        bigMaxRatio: 9 / 16,
      })
    );
  });

  it('should set bigMaxRatio to 3 / 2 if fixLargeTilesLandscape flag is false', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], false);
    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        bigMaxRatio: 3 / 2,
      })
    );
  });

  it('should set return boxes from layout manager', () => {
    const boxes = [
      {
        height: 0,
        left: 5,
        top: 10,
        width: 20,
      },
    ];
    mockGetLayout.mockReturnValue({ boxes });
    const layoutBoxes = layoutManager.getLayout({ width: 100, height: 150 }, [], false);
    expect(layoutBoxes).toBe(boxes);
  });
});
