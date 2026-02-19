import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MediaDeviceInfoJSON } from '@web/types';
import filterMobileCameras from './filterMobileCameras';
import { isMobile } from '@web/platform';
import { isFrontFacingLabel, isRearFacingLabel } from '@utils/cameraSwitch';

vi.mock('@web/platform');
vi.mock('@utils/cameraSwitch');
const createMockDevice = (deviceId: string, label: string): MediaDeviceInfoJSON =>
  ({
    kind: 'videoinput',
    deviceId,
    label,
  }) as MediaDeviceInfoJSON;

describe('filterMobileCameras', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('on non-mobile devices', () => {
    it('should return all devices unchanged', () => {
      vi.mocked(isMobile).mockReturnValue(false);

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'Front Camera 1'),
        createMockDevice('2', 'Front Camera 2'),
        createMockDevice('3', 'Rear Camera 1'),
        createMockDevice('4', 'Rear Camera 2'),
        createMockDevice('5', 'Unknown Camera'),
      ];

      const result = filterMobileCameras(devices);

      expect(result).toEqual(devices);
      expect(result.length).toBe(5);
    });
  });

  describe('on mobile devices', () => {
    beforeEach(() => {
      vi.mocked(isMobile).mockReturnValue(true);
    });

    it('should filter to only one front and one rear camera', () => {
      vi.mocked(isFrontFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('front') ?? false
      );
      vi.mocked(isRearFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('rear') ?? false
      );

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'Front Camera 1'),
        createMockDevice('2', 'Front Camera 2'),
        createMockDevice('3', 'Rear Camera 1'),
        createMockDevice('4', 'Rear Camera 2'),
      ];

      const result = filterMobileCameras(devices);

      expect(result.length).toBe(2);
      expect(result[0].deviceId).toBe('1'); // First front camera
      expect(result[1].deviceId).toBe('3'); // First rear camera
    });

    it('should keep unknown cameras that do not match front/rear patterns', () => {
      vi.mocked(isFrontFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('front') ?? false
      );
      vi.mocked(isRearFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('rear') ?? false
      );

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'Front Camera 1'),
        createMockDevice('2', 'Front Camera 2'),
        createMockDevice('3', 'Rear Camera 1'),
        createMockDevice('4', 'Rear Camera 2'),
        createMockDevice('5', 'USB Webcam'),
        createMockDevice('6', 'External Camera'),
      ];

      const result = filterMobileCameras(devices);

      expect(result.length).toBe(4); // 1 front + 1 rear + 2 unknown
      expect(result[0].deviceId).toBe('1'); // First front camera
      expect(result[1].deviceId).toBe('3'); // First rear camera
      expect(result[2].deviceId).toBe('5'); // Unknown camera
      expect(result[3].deviceId).toBe('6'); // Unknown camera
    });

    it('should handle only front cameras', () => {
      vi.mocked(isFrontFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('front') ?? false
      );
      vi.mocked(isRearFacingLabel).mockReturnValue(false);

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'Front Camera 1'),
        createMockDevice('2', 'Front Camera 2'),
      ];

      const result = filterMobileCameras(devices);

      expect(result.length).toBe(1);
      expect(result[0].deviceId).toBe('1'); // First front camera
    });

    it('should handle only rear cameras', () => {
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('rear') ?? false
      );

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'Rear Camera 1'),
        createMockDevice('2', 'Rear Camera 2'),
      ];

      const result = filterMobileCameras(devices);

      expect(result.length).toBe(1);
      expect(result[0].deviceId).toBe('1'); // First rear camera
    });

    it('should handle empty device array', () => {
      const devices: MediaDeviceInfoJSON[] = [];

      const result = filterMobileCameras(devices);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle devices with null or undefined labels', () => {
      vi.mocked(isFrontFacingLabel).mockReturnValue(false);
      vi.mocked(isRearFacingLabel).mockReturnValue(false);

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', ''),
        createMockDevice('2', 'Front Camera'),
      ];

      vi.mocked(isFrontFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('front') ?? false
      );

      const result = filterMobileCameras(devices);

      // Device with empty label should be treated as unknown and kept
      expect(result.length).toBe(2);
    });

    it('should use isFrontFacingLabel and isRearFacingLabel to categorize cameras', () => {
      vi.mocked(isFrontFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('user') ?? false
      );
      vi.mocked(isRearFacingLabel).mockImplementation(
        (label) => label?.toLowerCase().includes('rear') ?? false
      );

      const devices: MediaDeviceInfoJSON[] = [
        createMockDevice('1', 'User Camera'),
        createMockDevice('2', 'User Camera 2'),
        createMockDevice('3', 'Rear Camera'),
        createMockDevice('4', 'Rear Camera 2'),
      ];

      const result = filterMobileCameras(devices);

      expect(result.length).toBe(2);
      expect(result[0].deviceId).toBe('1'); // First front camera (user)
      expect(result[1].deviceId).toBe('3'); // First rear camera (rear)
    });
  });
});
