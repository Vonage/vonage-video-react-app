import { describe, it, expect } from 'vitest';
import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';
import cleanAndDedupeDeviceLabels from './cleanAndDedupeDeviceLabels';

const createMockDevice = (deviceId: string, label: string): Device => ({
  deviceId,
  label,
  kind: 'videoInput',
});

const createMockAudioDevice = (deviceId: string, label: string): Device => ({
  deviceId,
  label,
  kind: 'audioInput',
});

describe('cleanAndDedupeDeviceLabels', () => {
  describe('Device Label Cleaning', () => {
    it.each([
      // macOS/iOS device IDs
      ['FaceTime HD Camera (0000:0001)', 'FaceTime HD Camera'],
      ['Built-in Microphone (1a2b:3c4d)', 'Built-in Microphone'],

      // Windows USB paths
      ['USB Camera (USB\\VID_046D&PID_08CC&MI_00)', 'USB Camera'],
      ['Webcam (USB\\VID_1234&PID_5678)', 'Webcam'],

      // Linux USB bus info
      ['USB Camera (usb-0000:00:1d.0-1.4)', 'USB Camera'],
      ['Microphone (usb-0000:02:00.0-1)', 'Microphone'],

      // Generic bus patterns
      ['Audio Device (pci-0000:00:1b.0)', 'Audio Device'],

      // Simple numeric IDs
      ['Camera (1)', 'Camera'],
      ['Microphone (2)', 'Microphone'],

      // Chrome numbering
      ['Camera - 1', 'Camera'],
      ['Webcam - 2', 'Webcam'],

      // Space normalization
      ['USB   Camera  Name (0000:0001)', 'USB Camera Name'],
      ['  Microphone   Device  ', 'Microphone Device'],

      // Preserved descriptors
      ['Built-in Microphone', 'Built-in Microphone'],
      ['USB Camera (Built-in)', 'USB Camera (Built-in)'],
      ['External Monitor (HDMI)', 'External Monitor (HDMI)'],
    ])('cleans "%s" to "%s"', (input, expected) => {
      const devices = [createMockDevice('1', input)];
      const result = cleanAndDedupeDeviceLabels(devices);
      expect(result[0].label).toBe(expected);
    });
  });

  describe('Deduplication', () => {
    it('adds numbering to duplicate cleaned labels', () => {
      const devices = [
        createMockDevice('1', 'Camera (0000:0001)'),
        createMockDevice('2', 'Camera (0000:0002)'),
        createMockDevice('3', 'Camera (0000:0003)'),
      ];

      const result = cleanAndDedupeDeviceLabels(devices);

      expect(result.map((d) => d.label)).toEqual(['Camera', 'Camera (2)', 'Camera (3)']);
    });

    it('handles mixed duplicate and unique labels', () => {
      const devices = [
        createMockDevice('1', 'Camera (0000:0001)'),
        createMockAudioDevice('2', 'Microphone'),
        createMockDevice('3', 'Camera (0000:0002)'),
        createMockAudioDevice('4', 'Speaker'),
      ];

      const result = cleanAndDedupeDeviceLabels(devices);

      expect(result.map((d) => d.label)).toEqual(['Camera', 'Microphone', 'Camera (2)', 'Speaker']);
    });
  });

  describe('Edge Cases', () => {
    it.each([
      // Description, input, expected output
      ['empty array', [], []],
      ['empty label', [createMockDevice('1', '')], ['']],
      ['null label', [{ deviceId: '1', label: null, kind: 'videoInput' }], [null]],
    ])('handles %s', (_, input, expected) => {
      const result = cleanAndDedupeDeviceLabels(input);
      expect(result.map((d) => d.label)).toEqual(expected);
    });
  });

  describe('Real-World Scenarios', () => {
    it.each([
      [
        'macOS Chrome devices',
        [
          'FaceTime HD Camera (0000:0001)',
          'Built-in Microphone (0000:0002)',
          'USB Camera (1a2b:3c4d)',
          'USB Camera (1a2b:3c4e)',
        ],
        ['FaceTime HD Camera', 'Built-in Microphone', 'USB Camera', 'USB Camera (2)'],
      ],
      [
        'Windows Chrome devices',
        [
          'Integrated Camera (USB\\VID_04F2&PID_B5CE&MI_00)',
          'Microphone Array (USB\\VID_8086&PID_9D70&MI_02)',
          'Logitech Webcam (USB\\VID_046D&PID_08CC&MI_00)',
        ],
        ['Integrated Camera', 'Microphone Array', 'Logitech Webcam'],
      ],
      [
        'clean devices (no changes needed)',
        ['Built-in Microphone', 'External Webcam', 'Bluetooth Headset'],
        ['Built-in Microphone', 'External Webcam', 'Bluetooth Headset'],
      ],
    ])('%s', (_, inputLabels, expectedLabels) => {
      const devices = inputLabels.map((label, i) => createMockDevice(String(i), label));
      const result = cleanAndDedupeDeviceLabels(devices);
      expect(result.map((d) => d.label)).toEqual(expectedLabels);
    });
  });

  describe('Device Type Support', () => {
    it('works with mixed Device and AudioOutputDevice types', () => {
      const devices = [
        createMockDevice('1', 'Camera (0000:0001)'),
        { deviceId: '2', label: 'Speaker (0000:0002)' } as AudioOutputDevice,
      ];

      const result = cleanAndDedupeDeviceLabels(devices);

      expect(result.map((d) => d.label)).toEqual(['Camera', 'Speaker']);
    });
  });
});
