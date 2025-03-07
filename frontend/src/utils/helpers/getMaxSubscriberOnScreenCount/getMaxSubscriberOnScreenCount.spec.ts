import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isMobile } from '../../util';
import getMaxSubscriberOnScreenCount from './getMaxSubscriberOnScreenCount';

vi.mock('../../util');

describe('getMaxSubscribersOnScreenCount', () => {
  const mockedIsMobile = vi.mocked(isMobile);
  afterEach(() => {
    vi.resetAllMocks();
  });
  describe('on mobile', () => {
    beforeEach(() => {
      mockedIsMobile.mockImplementation(() => true);
    });
    it('should return 2 when viewing large screen', () => {
      const isViewingLargeTile = true;
      const isSharingScreen = false;
      const pinnedSubscriberCount = 0;
      const max = getMaxSubscriberOnScreenCount({
        isViewingLargeTile,
        isSharingScreen,
        pinnedSubscriberCount,
      });
      expect(max).toBe(2);
    });
    it('should return 3 when not viewing large screen', () => {
      const isViewingLargeTile = false;
      const isSharingScreen = false;
      const pinnedSubscriberCount = 0;
      const max = getMaxSubscriberOnScreenCount({
        isViewingLargeTile,
        isSharingScreen,
        pinnedSubscriberCount,
      });
      expect(max).toBe(3);
    });
  });
  describe('on desktop', () => {
    beforeEach(() => {
      mockedIsMobile.mockImplementation(() => false);
    });
    it('should return 5 when viewing large screen', () => {
      const isViewingLargeTile = true;
      const isSharingScreen = false;
      const pinnedSubscriberCount = 0;
      const max = getMaxSubscriberOnScreenCount({
        isViewingLargeTile,
        isSharingScreen,
        pinnedSubscriberCount,
      });
      expect(max).toBe(5);
    });
    it('should return 11 when not viewing large screen', () => {
      const isViewingLargeTile = false;
      const isSharingScreen = false;
      const pinnedSubscriberCount = 0;
      const max = getMaxSubscriberOnScreenCount({
        isViewingLargeTile,
        isSharingScreen,
        pinnedSubscriberCount,
      });
      expect(max).toBe(11);
    });
    it('should return 4 when publishing screenshare', () => {
      const isViewingLargeTile = true;
      const isSharingScreen = true;
      const pinnedSubscriberCount = 0;
      const max = getMaxSubscriberOnScreenCount({
        isViewingLargeTile,
        isSharingScreen,
        pinnedSubscriberCount,
      });
      expect(max).toBe(4);
    });
    it('should adjust count when multiple subscribers are pinned', () => {
      const isViewingLargeTile = true;
      const isSharingScreen = false;
      expect(
        getMaxSubscriberOnScreenCount({
          isViewingLargeTile,
          isSharingScreen,
          pinnedSubscriberCount: 1,
        })
      ).toBe(5);
      expect(
        getMaxSubscriberOnScreenCount({
          isViewingLargeTile,
          isSharingScreen,
          pinnedSubscriberCount: 2,
        })
      ).toBe(6);
      expect(
        getMaxSubscriberOnScreenCount({
          isViewingLargeTile,
          isSharingScreen,
          pinnedSubscriberCount: 3,
        })
      ).toBe(7);
    });
  });
});
