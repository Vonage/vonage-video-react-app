import { describe, expect, it, vi, afterEach } from 'vitest';
import { isDocumentPictureInPictureSupported } from './index';

describe('documentPictureInPicture helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isDocumentPictureInPictureSupported', () => {
    it('is false when the API is missing', () => {
      vi.stubGlobal('documentPictureInPicture', undefined);
      expect(isDocumentPictureInPictureSupported()).toBe(false);
    });

    it('is true when requestWindow exists', () => {
      vi.stubGlobal('documentPictureInPicture', { requestWindow: vi.fn() });
      expect(isDocumentPictureInPictureSupported()).toBe(true);
    });
  });
});
