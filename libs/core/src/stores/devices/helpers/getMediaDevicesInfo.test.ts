import { vi, describe, it, expect, beforeEach } from 'vitest';
import getMediaDevicesInfo$ from './getMediaDevicesInfo';
import * as isWebKitModule from '@web/platform/isWebKit';
import type { DevicesAPI } from '../types';
import type { MediaDeviceInfoJSON } from '@web/types';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

const makeDeviceInfo = (
  deviceId: string,
  kind: MediaDeviceKind,
  label: string
): MediaDeviceInfo =>
  ({
    deviceId,
    kind,
    label,
    groupId: `group-${deviceId}`,
    toJSON: () => ({ deviceId, kind, label, groupId: `group-${deviceId}` }),
  }) as MediaDeviceInfo;

const someDevices: MediaDeviceInfo[] = [
  makeDeviceInfo('audio-input-1', 'audioinput', 'Microphone'),
  makeDeviceInfo('video-input-1', 'videoinput', 'Camera'),
  makeDeviceInfo('audio-output-1', 'audiooutput', 'Speakers'),
];

function makeStoreMock(currentDevices: MediaDeviceInfoJSON[] = []) {
  return {
    getMetadata: () => ({ isStoreReady: Promise.resolve() }),
    getState: () => ({ mediaDeviceInfo: currentDevices }),
  } as unknown as DevicesAPI;
}

describe('getMediaDevicesInfo', () => {
  beforeEach(() => {
    vi.spyOn(isWebKitModule, 'default').mockReturnValue(false);

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(someDevices),
      },
    });
  });

  it('should return the list of devices from enumerateDevices', async () => {
    const store = makeStoreMock([]);
    const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

    const result = await getMediaDevicesInfo();

    expect(result).toHaveLength(someDevices.length);
    expect(result[0]).toMatchObject({ deviceId: 'audio-input-1', kind: 'audioinput' });
  });

  it('should filter out devices without a deviceId', async () => {
    const devicesWithBlankId: MediaDeviceInfo[] = [
      ...someDevices,
      makeDeviceInfo('', 'audioinput', 'Ghost Device'),
    ];

    vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(devicesWithBlankId);

    const store = makeStoreMock([]);
    const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

    const result = await getMediaDevicesInfo();

    expect(result).toHaveLength(someDevices.length);
    expect(result.every((d) => d.deviceId)).toBe(true);
  });

  describe('WebKit transient device loss retry', () => {
    it('should NOT retry when not on WebKit, even if fewer devices are returned', async () => {
      vi.spyOn(isWebKitModule, 'default').mockReturnValue(false);

      const fewerDevices = someDevices.slice(0, 1);
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(fewerDevices);

      const currentDevices = someDevices.map((d) => d.toJSON());
      const store = makeStoreMock(currentDevices);
      const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

      const result = await getMediaDevicesInfo();

      expect(result).toHaveLength(1);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on WebKit when the device count has not decreased', async () => {
      vi.spyOn(isWebKitModule, 'default').mockReturnValue(true);
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(someDevices);

      const currentDevices = someDevices.map((d) => d.toJSON());
      const store = makeStoreMock(currentDevices);
      const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

      const result = await getMediaDevicesInfo();

      expect(result).toHaveLength(someDevices.length);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on WebKit when there were no previous devices (first load)', async () => {
      vi.spyOn(isWebKitModule, 'default').mockReturnValue(true);

      const store = makeStoreMock([]);
      const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

      const result = await getMediaDevicesInfo();

      expect(result).toHaveLength(someDevices.length);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);
    });

    it('should retry on WebKit when fewer devices are returned than currently stored', async () => {
      vi.spyOn(isWebKitModule, 'default').mockReturnValue(true);

      const fewerDevices = someDevices.slice(0, 1);

      vi.spyOn(navigator.mediaDevices, 'enumerateDevices')
        .mockResolvedValueOnce(fewerDevices) // transient result: fewer devices
        .mockResolvedValue(someDevices); // settled result: full list restored

      const currentDevices = someDevices.map((d) => d.toJSON());
      const store = makeStoreMock(currentDevices);
      const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

      const result = await getMediaDevicesInfo();

      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(someDevices.length);
    });

    it('should throw after all retries are exhausted on WebKit with persistently fewer devices', async () => {
      vi.spyOn(isWebKitModule, 'default').mockReturnValue(true);

      const fewerDevices = someDevices.slice(0, 1);
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(fewerDevices);

      const currentDevices = someDevices.map((d) => d.toJSON());
      const store = makeStoreMock(currentDevices);
      const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

      await expect(getMediaDevicesInfo()).rejects.toThrow();

      // idempotentCallbackWithRetry defaults: 1 initial + 2 retries = 3 total attempts
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(3);
    });
  });
});
