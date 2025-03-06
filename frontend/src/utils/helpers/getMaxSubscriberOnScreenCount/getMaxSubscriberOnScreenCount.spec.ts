import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getMaxSubscriberOnScreenCount from './getMaxSubscriberOnScreenCount';
import { isMobile } from '../../util';

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
      const isPublishingScreenshare = false;
      const max = getMaxSubscriberOnScreenCount(isViewingLargeTile, isPublishingScreenshare);
      expect(max).toBe(2);
    });
    it('should return 3 when not viewing large screen', () => {
      const isViewingLargeTile = false;
      const isPublishingScreenshare = false;
      const max = getMaxSubscriberOnScreenCount(isViewingLargeTile, isPublishingScreenshare);
      expect(max).toBe(3);
    });
  });
  describe('on desktop', () => {
    beforeEach(() => {
      mockedIsMobile.mockImplementation(() => false);
    });
    it('should return 5 when viewing large screen', () => {
      const isViewingLargeTile = true;
      const isPublishingScreenshare = false;
      const max = getMaxSubscriberOnScreenCount(isViewingLargeTile, isPublishingScreenshare);
      expect(max).toBe(5);
    });
    it('should return 11 when not viewing large screen', () => {
      const isViewingLargeTile = false;
      const isPublishingScreenshare = false;
      const max = getMaxSubscriberOnScreenCount(isViewingLargeTile, isPublishingScreenshare);
      expect(max).toBe(11);
    });
    it('should return 4 when publishing screenshare', () => {
      const isViewingLargeTile = true;
      const isPublishingScreenshare = true;
      const max = getMaxSubscriberOnScreenCount(isViewingLargeTile, isPublishingScreenshare);
      expect(max).toBe(4);
    });
  });
});
