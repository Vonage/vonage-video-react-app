import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import requestDeviceAccess from './requestDeviceAccess';

const makeStream = (stop: () => void): MediaStream =>
  ({ getTracks: () => [{ stop } as unknown as MediaStreamTrack] }) as unknown as MediaStream;

describe('requestDeviceAccess', () => {
  beforeEach(() => {
    setupWindowNavigatorMock();
  });

  it('requests the microphone with an audio-only constraint and reports granted', async () => {
    const getUserMedia = vi
      .spyOn(globalThis.navigator.mediaDevices, 'getUserMedia')
      .mockResolvedValue(makeStream(vi.fn()));

    const outcome = await requestDeviceAccess({ device: 'microphone' });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(outcome).toBe('granted');
  });

  it('requests the camera with a video-only constraint and reports granted', async () => {
    const getUserMedia = vi
      .spyOn(globalThis.navigator.mediaDevices, 'getUserMedia')
      .mockResolvedValue(makeStream(vi.fn()));

    const outcome = await requestDeviceAccess({ device: 'camera' });

    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(outcome).toBe('granted');
  });

  it('stops every acquired track so it only pokes the permission', async () => {
    const stop = vi.fn();
    vi.spyOn(globalThis.navigator.mediaDevices, 'getUserMedia').mockResolvedValue(makeStream(stop));

    await requestDeviceAccess({ device: 'microphone' });

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('reports "blocked" when the browser refuses with NotAllowedError (explicit block)', async () => {
    vi.spyOn(globalThis.navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    );

    await expect(requestDeviceAccess({ device: 'microphone' })).resolves.toBe('blocked');
  });

  it('reports "unavailable" for any other failure (e.g. no device present)', async () => {
    vi.spyOn(globalThis.navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
      new DOMException('Requested device not found', 'NotFoundError')
    );

    await expect(requestDeviceAccess({ device: 'camera' })).resolves.toBe('unavailable');
  });
});
