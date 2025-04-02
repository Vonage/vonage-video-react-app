import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import createDeviceManager from './createDeviceManager';
import localStorageMock from '../localStorageMock';

describe('DeviceManager', () => {
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    enumerateDevicesMock = vi.fn();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        enumerateDevices: enumerateDevicesMock,
      },
    });
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  test('returns undefined if no device is stored', async () => {
    enumerateDevicesMock.mockResolvedValue([]);

    const deviceManager = createDeviceManager();
    const result = await deviceManager.getConnectedDeviceId('videoinput');

    expect(result).toBeUndefined();
  });

  test('returns stored deviceId if it is still connected', async () => {
    window.localStorage.setItem('videoSource', 'device-123');
    enumerateDevicesMock.mockResolvedValue([
      { deviceId: 'device-123', kind: 'videoinput' } as MediaDeviceInfo,
    ]);

    const deviceManager = createDeviceManager();
    const result = await deviceManager.getConnectedDeviceId('videoinput');

    expect(result).toBe('device-123');
  });

  test('returns undefined if stored device is not connected', async () => {
    window.localStorage.setItem('videoSource', 'device-123');
    enumerateDevicesMock.mockResolvedValue([
      { deviceId: 'device-1234', kind: 'videoinput' } as MediaDeviceInfo,
    ]);

    const deviceManager = createDeviceManager();
    const result = await deviceManager.getConnectedDeviceId('videoinput');

    expect(result).toBeUndefined();
  });
});
