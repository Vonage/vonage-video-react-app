import { renderHook, waitFor } from '@testing-library/react';
import mediaDevices$ from './devices$';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';

describe('mediaDevices$ namespace', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(makeMediaDeviceInfos()),
        getUserMedia: Promise.resolve({
          getVideoTracks: () => [],
          getAudioTracks: () => [],
        } as unknown as MediaStream),
      },
    });
  });

  it('should update devices when devicechange event triggers', async () => {
    const { mediaDevices } = globalThis.navigator;

    mediaDevices$.reset();

    const { result } = renderHook(() => mediaDevices$.use());
    let [state] = result.current;

    await waitFor(() => {
      [state] = result.current;

      expect(state.mediaDeviceInfo.length).toBeGreaterThan(0);
    });

    expect(state.mediaDeviceInfo.length).toBeGreaterThan(0);

    const newMediaDevicesInfo = [
      {
        deviceId: 'audio-input-new',
        kind: 'audioinput',
        label: 'New Microphone',
        groupId: 'group-new',
        toJSON: () => ({
          deviceId: 'audio-input-new',
          kind: 'audioinput' as MediaDeviceKind,
          label: 'New Microphone',
          groupId: 'group-new',
        }),
      },
      {
        deviceId: 'video-input-new',
        kind: 'videoinput',
        label: 'New Camera',
        groupId: 'group-new',
        toJSON: () => ({
          deviceId: 'video-input-new',
          kind: 'videoinput' as MediaDeviceKind,
          label: 'New Camera',
          groupId: 'group-new',
        }),
      },
    ] as MediaDeviceInfo[];

    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue(newMediaDevicesInfo);

    const addEventListenerCalls = vi.mocked(mediaDevices.addEventListener).mock.calls;
    const deviceChangeHandler = addEventListenerCalls.find(
      (call) => call[0] === 'devicechange'
    )?.[1] as EventListener;

    deviceChangeHandler(new Event('devicechange'));

    await waitFor(() => {
      [state] = result.current;
      if (state.mediaDeviceInfo[0]?.deviceId !== 'audio-input-new') {
        throw new Error('Devices not updated yet');
      }
    });

    expect(state.mediaDeviceInfo).toEqual(
      expect.arrayContaining(
        newMediaDevicesInfo.map((device): unknown => {
          return expect.objectContaining({
            deviceId: device.deviceId,
            kind: device.kind,
            label: device.label,
            groupId: device.groupId,
          });
        })
      )
    );

    expect(vi.mocked(mediaDevices.enumerateDevices)).toHaveBeenCalled();
  });
});
