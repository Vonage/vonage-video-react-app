import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getUserMedia from '.';
import mediaDevices$ from '../../devices$';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';

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
});
