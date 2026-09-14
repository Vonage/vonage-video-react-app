import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import requestDeviceLabels from '.';
import mediaDevices$ from '../../mediaDevices$';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import { mediaDevicesEnvelop } from '@core/interceptors';
import * as isFirefoxModule from '@web/platform/isFirefox';

describe('requestDeviceLabels', () => {
  const stopTrack = vi.fn();
  const mockStream = {
    getTracks: () => [{ stop: stopTrack }],
  } as unknown as MediaStream;

  const run = () => requestDeviceLabels.bind(mediaDevices$.actions)()(mediaDevices$);

  beforeEach(() => {
    stopTrack.mockClear();
    mediaDevices$.reset();
  });

  afterEach(() => {
    mediaDevices$.reset();
  });

  it('requests permission and releases the tracks on Firefox when labels are empty', async () => {
    vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([
          { deviceId: 'device1', kind: 'videoinput', label: '' },
        ] as MediaDeviceInfo[]),
        getUserMedia: Promise.resolve(mockStream),
      },
    });
    mediaDevicesEnvelop.rebind(navigator);

    await run();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it('does not request permission on Firefox when labels are already present', async () => {
    vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

    const getUserMediaSpy = vi.fn();
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([
          { deviceId: 'device1', kind: 'videoinput', label: 'Camera' },
        ] as MediaDeviceInfo[]),
        getUserMedia: getUserMediaSpy,
      },
    });
    mediaDevicesEnvelop.rebind(navigator);

    await run();

    expect(getUserMediaSpy).not.toHaveBeenCalled();
  });

  it('is a no-op on non-Firefox browsers and never acquires media', async () => {
    vi.spyOn(isFirefoxModule, 'default').mockReturnValue(false);

    const getUserMediaSpy = vi.fn();
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([] as MediaDeviceInfo[]),
        getUserMedia: getUserMediaSpy,
      },
    });
    mediaDevicesEnvelop.rebind(navigator);

    await run();

    expect(getUserMediaSpy).not.toHaveBeenCalled();
  });
});
