import { vi } from 'vitest';
import { nativeDevices } from '@utils/mockData/device';

/**
 * Mock implementation of navigator.mediaDevices for testing.
 * Provides realistic browser media API behavior without actual device access.
 */

/**
 * Creates a mock MediaDevices object.
 */
export function createMockMediaDevices() {
  return {
    enumerateDevices: vi.fn(() => Promise.resolve(nativeDevices as MediaDeviceInfo[])),
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
            kind: 'audio',
            label: 'Mock Audio Track',
            enabled: true,
            id: 'mock-audio-track-id',
          },
          {
            stop: vi.fn(),
            kind: 'video',
            label: 'Mock Video Track',
            enabled: true,
            id: 'mock-video-track-id',
          },
        ],
        getAudioTracks: () => [
          {
            stop: vi.fn(),
            kind: 'audio',
            label: 'Mock Audio Track',
            enabled: true,
            id: 'mock-audio-track-id',
          },
        ],
        getVideoTracks: () => [
          {
            stop: vi.fn(),
            kind: 'video',
            label: 'Mock Video Track',
            enabled: true,
            id: 'mock-video-track-id',
          },
        ],
      } as unknown as MediaStream)
    ),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    getSupportedConstraints: vi.fn(() => ({
      aspectRatio: true,
      autoGainControl: true,
      brightness: true,
      channelCount: true,
      colorTemperature: true,
      contrast: true,
      deviceId: true,
      echoCancellation: true,
      exposureCompensation: true,
      exposureMode: true,
      exposureTime: true,
      facingMode: true,
      focusDistance: true,
      focusMode: true,
      frameRate: true,
      groupId: true,
      height: true,
      iso: true,
      latency: true,
      noiseSuppression: true,
      pan: true,
      pointsOfInterest: true,
      sampleRate: true,
      sampleSize: true,
      saturation: true,
      sharpness: true,
      tilt: true,
      torch: true,
      whiteBalanceMode: true,
      width: true,
      zoom: true,
    })),
  };
}

/**
 * Sets up mock media devices on the global navigator object.
 * Call this in beforeEach to ensure clean state for each test.
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupMockMediaDevices();
 * });
 * ```
 */
export function setupMockMediaDevices(): void {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    writable: true,
    configurable: true,
    value: createMockMediaDevices(),
  });

  // Mock navigator.permissions for usePermissions hook
  Object.defineProperty(globalThis.navigator, 'permissions', {
    writable: true,
    configurable: true,
    value: {
      query: vi.fn(() =>
        Promise.resolve({
          state: 'granted',
          onchange: null,
        })
      ),
    },
  });
}

/**
 * Restores the original navigator.mediaDevices and permissions.
 * Call this in afterEach to clean up.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   restoreMediaDevices();
 * });
 * ```
 */
export function restoreMediaDevices(): void {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    writable: true,
    configurable: true,
    value: undefined,
  });

  Object.defineProperty(globalThis.navigator, 'permissions', {
    writable: true,
    configurable: true,
    value: undefined,
  });
}

const mockMediaDevices = {
  createMockMediaDevices,
  setupMockMediaDevices,
  restoreMediaDevices,
};

export default mockMediaDevices;
