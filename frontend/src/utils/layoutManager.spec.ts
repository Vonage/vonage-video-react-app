import * as OpentokLayoutModule from 'opentok-layout-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LayoutManager from './layoutManager';

vi.mock('opentok-layout-js', () => {
  const getLayout = vi.fn();
  const mockConstructor = vi.fn().mockReturnValue({
    getLayout,
  });

  return {
    default: mockConstructor,
    getLayout,
  };
});

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;
  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  it('should create a new layout manager with options', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], false);
    expect(OpentokLayoutModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        containerWidth: 100,
        containerHeight: 150,
      })
    );
  });

  it('should set bigMaxRatio to 9 / 16 if shouldMakeLargeTilesLandscape flag is true', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], true);
    expect(OpentokLayoutModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        bigMaxRatio: 9 / 16,
      })
    );
  });

  it('should set bigMaxRatio to 3 / 2 if shouldMakeLargeTilesLandscape flag is false', () => {
    layoutManager.getLayout({ width: 100, height: 150 }, [], false);
    expect(OpentokLayoutModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        bigMaxRatio: 3 / 2,
      })
    );
  });
});
