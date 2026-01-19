import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import makeMediaDeviceInfos from '@common-test/fixtures/makeMediaDeviceInfos';
import DeviceStore from './deviceStore';
import localStorageMock from '../mockData/localStorageMock';
import { setStorageItem, STORAGE_KEYS } from '../storage';

describe('DeviceStore', () => {
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;
  let deviceStore: DeviceStore;

  beforeEach(() => {
    deviceStore = new DeviceStore();
    enumerateDevicesMock = vi.fn();

    vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockImplementation(
      enumerateDevicesMock as unknown as () => Promise<MediaDeviceInfo[]>
    );

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
  });

  test('returns stored deviceId if it is still connected', async () => {
    const devices = makeMediaDeviceInfos();
    const videoDevice = devices.find((d) => d.kind === 'videoinput')!;
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, videoDevice.deviceId);
    enumerateDevicesMock.mockResolvedValue(devices);

    await deviceStore.init();
    const result = deviceStore.getConnectedDeviceId('videoinput');

    expect(result).toBe(videoDevice.deviceId);
  });

  test('returns undefined if stored device is not connected', async () => {
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, 'device-not-connected');
    enumerateDevicesMock.mockResolvedValue(makeMediaDeviceInfos());

    await deviceStore.init();
    const result = deviceStore.getConnectedDeviceId('videoinput');

    expect(result).toBeUndefined();
  });
});
