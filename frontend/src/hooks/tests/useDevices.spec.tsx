import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { getDevices, getAudioOutputDevices, type Device } from '@vonage/client-sdk-video';
import useDevices from '../useDevices';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

vi.mock('@vonage/client-sdk-video');

describe('useDevices', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

    // Set default mock that will be used if not overridden in tests
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
  });

  it('warns if enumerateDevices is not supported', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    Object.defineProperty(global.navigator.mediaDevices, 'enumerateDevices', {
      writable: true,
      value: false,
    });

    renderHook(() => useDevices());

    expect(consoleWarnSpy).toBeCalledWith('enumerateDevices() not supported.');
  });

  it('returns an empty object of media devices if none are connected', async () => {
    const { result } = renderHook(() => useDevices());

    const expectedAllMediaDevices = {
      audioInputDevices: [],
      videoInputDevices: [],
      audioOutputDevices: [],
    };
    await waitFor(() => expect(result.current.allMediaDevices).toEqual(expectedAllMediaDevices));
  });

  it('returns any connected audioInputDevices', async () => {
    const audioInputDevices: MediaDeviceInfo[] = [
      {
        kind: 'audioinput',
        deviceId: 'some-id',
        label: 'Purple HairPods',
        groupId: 'group-id',
        toJSON: () => ({}),
      },
    ];

    vi.mocked(getDevices).mockImplementationOnce((callback) => {
      setTimeout(() => {
        callback(undefined, audioInputDevices as unknown as Device[]);
      }, 0);
    });
    vi.mocked(getAudioOutputDevices).mockImplementationOnce(() => Promise.resolve([]));

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.audioInputDevices).toEqual(audioInputDevices)
    );
  });

  it('returns any connected videoInputDevices', async () => {
    const videoInputDevices: MediaDeviceInfo[] = [
      {
        kind: 'videoinput',
        deviceId: 'some-id',
        label: 'Webcam',
        groupId: 'group-id',
        toJSON: () => ({}),
      },
    ];
    vi.mocked(getDevices).mockImplementationOnce((callback) => {
      setTimeout(() => {
        callback(undefined, videoInputDevices as unknown as Device[]);
      }, 0);
    });
    vi.mocked(getAudioOutputDevices).mockImplementationOnce(() => Promise.resolve([]));

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.videoInputDevices).toEqual(videoInputDevices)
    );
  });

  it('returns any connected audioOutputDevices', async () => {
    const audioOutputDevices: MediaDeviceInfo[] = [
      {
        deviceId: 'some-id',
        label: 'Purple HairPods',
        kind: 'audiooutput',
        groupId: 'group-id',
        toJSON: () => ({}),
      },
    ];
    vi.mocked(getAudioOutputDevices).mockImplementationOnce(() =>
      Promise.resolve(audioOutputDevices)
    );
    vi.mocked(getDevices).mockImplementationOnce((callback) => {
      setTimeout(() => {
        callback(undefined, []);
      }, 0);
    });

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.audioOutputDevices).toEqual(audioOutputDevices)
    );
  });
});
