import { describe, it, expect, vi, beforeEach } from 'vitest';
import resolveMobileVideoSource from './resolveMobileVideoSource';
import { isMobile } from '@web/platform';
import isFrontFacingLabel from '../isFrontFacingLabel';
import isRearFacingLabel from '../isRearFacingLabel';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@web/platform');
vi.mock('../isFrontFacingLabel');
vi.mock('../isRearFacingLabel');

const createMockStream = (deviceId: string) => {
  const stop = vi.fn();
  const track = {
    getSettings: () => ({ deviceId }),
    stop,
  };
  return {
    getVideoTracks: () => [track],
    getTracks: () => [track],
  };
};

describe('resolveMobileVideoSource', () => {
  const getUserMediaMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: vi.fn().mockResolvedValue([]),
        getUserMedia: getUserMediaMock,
      },
    });
  });

  describe('on non-mobile devices', () => {
    it('returns deviceId unchanged', async () => {
      vi.mocked(isMobile).mockReturnValue(false);

      const result = await resolveMobileVideoSource('device-123', 'Front Camera');

      expect(result).toBe('device-123');
      expect(getUserMediaMock).not.toHaveBeenCalled();
    });
  });

  describe('when deviceId is empty', () => {
    it('returns empty deviceId unchanged', async () => {
      vi.mocked(isMobile).mockReturnValue(true);

      const result = await resolveMobileVideoSource('', 'Front Camera');

      expect(result).toBe('');
      expect(getUserMediaMock).not.toHaveBeenCalled();
    });
  });

  describe('when label is neither front nor rear facing', () => {
    it('returns deviceId unchanged without calling getUserMedia', async () => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);

      const result = await resolveMobileVideoSource('device-123', 'USB Webcam');

      expect(result).toBe('device-123');
      expect(getUserMediaMock).not.toHaveBeenCalled();
    });

    it('handles null label', async () => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);

      const result = await resolveMobileVideoSource('device-123', null);

      expect(result).toBe('device-123');
      expect(getUserMediaMock).not.toHaveBeenCalled();
    });

    it('handles undefined label', async () => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);

      const result = await resolveMobileVideoSource('device-123');

      expect(result).toBe('device-123');
      expect(getUserMediaMock).not.toHaveBeenCalled();
    });
  });

  describe('on mobile with front-facing label', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(true);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);
    });

    it('calls getUserMedia with facingMode user and returns resolved deviceId', async () => {
      const resolvedId = 'resolved-front-camera-id';
      getUserMediaMock.mockResolvedValue(createMockStream(resolvedId) as unknown as MediaStream);

      const result = await resolveMobileVideoSource('original-id', 'Front Camera');

      expect(getUserMediaMock).toHaveBeenCalledWith({
        video: { facingMode: { ideal: 'user' } },
      });
      expect(result).toBe(resolvedId);
    });

    it('stops all tracks after resolving', async () => {
      const mockStream = createMockStream('resolved-id');
      getUserMediaMock.mockResolvedValue(mockStream as unknown as MediaStream);

      await resolveMobileVideoSource('original-id', 'Front Camera');

      mockStream.getTracks().forEach((t) => expect(t.stop).toHaveBeenCalled());
    });
  });

  describe('on mobile with rear-facing label', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockReturnValue(true);
    });

    it('calls getUserMedia with facingMode environment and returns resolved deviceId', async () => {
      const resolvedId = 'resolved-rear-camera-id';
      getUserMediaMock.mockResolvedValue(createMockStream(resolvedId) as unknown as MediaStream);

      const result = await resolveMobileVideoSource('original-id', 'Rear Camera');

      expect(getUserMediaMock).toHaveBeenCalledWith({
        video: { facingMode: { ideal: 'environment' } },
      });
      expect(result).toBe(resolvedId);
    });
  });

  describe('fallback when getUserMedia fails', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
      vi.mocked(isFrontFacingLabel).mockReturnValue(true);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);
    });

    it('returns original deviceId when getUserMedia throws', async () => {
      getUserMediaMock.mockRejectedValue(new Error('Permission denied'));

      const result = await resolveMobileVideoSource('original-id', 'Front Camera');

      expect(result).toBe('original-id');
    });

    it('returns original deviceId when stream has no video tracks', async () => {
      getUserMediaMock.mockResolvedValue({
        getVideoTracks: () => [],
        getTracks: () => [],
      } as unknown as MediaStream);

      const result = await resolveMobileVideoSource('original-id', 'Front Camera');

      expect(result).toBe('original-id');
    });

    it('returns original deviceId when getSettings().deviceId is undefined', async () => {
      const track = {
        getSettings: () => ({}),
        stop: vi.fn(),
      };
      getUserMediaMock.mockResolvedValue({
        getVideoTracks: () => [track],
        getTracks: () => [track],
      } as unknown as MediaStream);

      const result = await resolveMobileVideoSource('original-id', 'Front Camera');

      expect(result).toBe('original-id');
    });
  });
});
