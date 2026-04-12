import { describe, it, expect, vi, beforeEach } from 'vitest';
import selectDevice from '.';
import mediaDevices$ from '../../devices$';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';

const devices = makeMediaDeviceInfos();

describe('selectDevice', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve({
          getTracks: () => [{ stop: vi.fn() }],
          getVideoTracks: () => [],
          getAudioTracks: () => [],
        } as unknown as MediaStream),
      },
    });

    mediaDevices$.reset();
  });

  it('should throw for invalid device kind', async () => {
    const boundSelectDevice = selectDevice.bind(mediaDevices$.actions);
    const action = boundSelectDevice('invalidkind' as MediaDeviceKind, 'device-1');

    await expect(action(mediaDevices$)).rejects.toThrow();
  });

  it('should clear device when deviceId is null', async () => {
    const boundSelectDevice = selectDevice.bind(mediaDevices$.actions);
    const action = boundSelectDevice('audioinput', undefined);

    await action(mediaDevices$);

    const state = mediaDevices$.getState();
    expect(state.audioinput).toBeUndefined();
  });

  it('should select a valid device', async () => {
    const audioDevice = devices.find((d) => d.kind === 'audioinput');
    const boundSelectDevice = selectDevice.bind(mediaDevices$.actions);
    const action = boundSelectDevice('audioinput', audioDevice!.deviceId);

    await action(mediaDevices$);

    const state = mediaDevices$.getState();
    expect(state.audioinput).toBe(audioDevice!.deviceId);
  });
});
