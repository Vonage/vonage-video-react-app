import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  AudioOutputDevice,
  Device,
  getDevices,
  getAudioOutputDevices,
  OTError,
} from '@vonage/client-sdk-video';
import useDevices from '../useDevices';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

type GetDevicesCallback = (err?: OTError, devices?: Device[]) => void;

vi.mock('@vonage/client-sdk-video');

describe('useDevices', () => {
  const reMockTheMocks = () => {
    vi.mocked(getDevices).mockImplementation((callback: GetDevicesCallback) => {
      callback(undefined, []);
    });
    vi.mocked(getAudioOutputDevices).mockImplementation(() => Promise.resolve([]));
  };

  beforeEach(() => {
    vi.resetAllMocks();
    reMockTheMocks();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

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
    const audioInputDevices: Device[] = [
      {
        kind: 'audioInput',
        deviceId: 'some-id',
        label: 'Purple HairPods',
      },
    ];
    vi.mocked(getDevices).mockImplementation((callback: GetDevicesCallback) => {
      callback(undefined, audioInputDevices);
    });

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.audioInputDevices).toEqual(audioInputDevices)
    );
  });

  it('returns any connected videoInputDevices', async () => {
    const videoInputDevices: Device[] = [
      {
        kind: 'videoInput',
        deviceId: 'some-id',
        label: 'Purple HairPods',
      },
    ];
    vi.mocked(getDevices).mockImplementation((callback: GetDevicesCallback) => {
      callback(undefined, videoInputDevices);
    });

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.videoInputDevices).toEqual(videoInputDevices)
    );
  });

  it('returns any connected audioOutputDevices', async () => {
    const audioOutputDevices: AudioOutputDevice[] = [
      {
        deviceId: 'some-id',
        label: 'Purple HairPods',
      },
    ];
    vi.mocked(getAudioOutputDevices).mockImplementation(() => Promise.resolve(audioOutputDevices));

    const { result } = renderHook(() => useDevices());

    await waitFor(() =>
      expect(result.current.allMediaDevices.audioOutputDevices).toEqual(audioOutputDevices)
    );
  });
});
