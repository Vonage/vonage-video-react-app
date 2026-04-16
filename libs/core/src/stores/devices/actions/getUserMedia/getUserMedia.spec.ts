import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getUserMedia from '.';
import mediaDevices$ from '../../devices$';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';
import { mediaDevicesEnvelop } from '@core/interceptors';

const devices = makeMediaDeviceInfos();

describe('getUserMedia', () => {
  const mockStream = {
    getTracks: () => [],
    getVideoTracks: () => [],
    getAudioTracks: () => [],
  } as unknown as MediaStream;

  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve(mockStream),
      },
    });

    mediaDevicesEnvelop.rebind(navigator);

    mediaDevices$.reset();
  });

  afterEach(() => {
    mediaDevices$.reset();
  });

  it('should call navigator.mediaDevices.getUserMedia with constraints', async () => {
    const constraints = { video: true, audio: true };
    const boundGetUserMedia = getUserMedia.bind(mediaDevices$.actions);
    const action = boundGetUserMedia(constraints);

    await action(mediaDevices$);

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(constraints);
  });

  it('should return the media stream', async () => {
    const constraints = { audio: true };
    const boundGetUserMedia = getUserMedia.bind(mediaDevices$.actions);
    const action = boundGetUserMedia(constraints);

    const result = await action(mediaDevices$);

    expect(result).toBe(mockStream);
  });

  it('should sync media devices info after successfully getting user media', async () => {
    const constraints = { audio: true };
    const boundGetUserMedia = getUserMedia.bind(mediaDevices$.actions);
    const action = boundGetUserMedia(constraints);
    const syncMediaDevicesInfoSpy = vi.spyOn(mediaDevices$.actions, 'syncMediaDevicesInfo');

    await action(mediaDevices$);

    expect(syncMediaDevicesInfoSpy).toHaveBeenCalledTimes(1);
  });

  it('should normalize Firefox permission denial errors for the sdk', async () => {
    const reason = new Error('The object can not be found here');
    reason.name = 'NotFoundError';

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.reject(reason),
      },
    });

    mediaDevicesEnvelop.rebind(navigator);

    const boundGetUserMedia = getUserMedia.bind(mediaDevices$.actions);
    const action = boundGetUserMedia({ audio: true, video: true });

    await expect(action(mediaDevices$)).rejects.toEqual(
      new DOMException('Permission denied by system', 'NotAllowedError')
    );
  });

  it('should rethrow non Firefox permission errors', async () => {
    const reason = new Error('Camera is busy');
    reason.name = 'NotReadableError';

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.reject(reason),
      },
    });

    mediaDevicesEnvelop.rebind(navigator);

    const boundGetUserMedia = getUserMedia.bind(mediaDevices$.actions);
    const action = boundGetUserMedia({ audio: true });

    await expect(action(mediaDevices$)).rejects.toBe(reason);
  });
});
