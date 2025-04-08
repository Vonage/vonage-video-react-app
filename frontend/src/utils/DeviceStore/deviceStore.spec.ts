import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import DeviceStore from './deviceStore';
import localStorageMock from '../mockData/localStorageMock';

describe('DeviceStore', () => {
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;
  let deviceStore: DeviceStore;

  beforeEach(() => {
    deviceStore = new DeviceStore();
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

  test('returns stored deviceId if it is still connected', async () => {
    window.localStorage.setItem('videoSource', 'device-123');
    enumerateDevicesMock.mockResolvedValue([
      { deviceId: 'device-123', kind: 'videoinput' } as MediaDeviceInfo,
    ]);

    await deviceStore.init();
    const result = deviceStore.getConnectedDeviceId('videoinput');

    expect(result).toBe('device-123');
  });

  test('returns undefined if stored device is not connected', async () => {
    window.localStorage.setItem('videoSource', 'device-123');
    enumerateDevicesMock.mockResolvedValue([
      { deviceId: 'device-1234', kind: 'videoinput' } as MediaDeviceInfo,
    ]);

    await deviceStore.init();
    const result = deviceStore.getConnectedDeviceId('videoinput');

    expect(result).toBeUndefined();
  });
});
