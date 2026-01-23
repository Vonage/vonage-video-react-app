/* eslint-disable @typescript-eslint/no-use-before-define */
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import devices$, { initialValue, metadata, useConnectedDeviceId } from '@core/stores/devices';
import type * as ClientSdkVideo from '@vonage/client-sdk-video';
import wait from '@common/execution/wait';
import SuspenseBoundary from '@common/components/SuspenseBoundary';
import defer from 'easy-cancelable-promise/defer';
import renderAsyncHook from '@test-helpers/renderAsyncHook';

describe('devices$', () => {
  beforeEach(() => {
    vi.spyOn(clientSdkVideo, 'getDevices').mockImplementation(async (callback) => {
      await wait(0);
      callback(undefined, devices);
    });

    vi.spyOn(clientSdkVideo, 'getAudioOutputDevices').mockImplementation(() =>
      Promise.resolve(mediaDevicesInfo)
    );

    vi.spyOn(globalThis.navigator.mediaDevices, 'addEventListener').mockImplementation(() => {});

    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockImplementation(() =>
      Promise.resolve(mediaDevicesInfo)
    );

    devices$.reset(initialValue, { ...metadata });
    vi.clearAllMocks();
  });

  it('should initialize correctly without suspense', async () => {
    expect.assertions(1);

    const { result } = await renderAsyncHook(() => useConnectedDeviceId('audioinput'), {
      wrapper: SuspenseBoundary,
    });

    await waitFor(() => {
      expect(result.current).toEqual('audioinput-1');
    });
  });

  it('should initialize correctly with suspense', async () => {
    const loadingMediaDevicesDeferred = defer<MediaDeviceInfo[]>();

    devices$.setMetadata((metadata) => ({
      ...metadata,
      loadingMediaDevices: loadingMediaDevicesDeferred.promise,
    }));

    const { result } = await renderAsyncHook(() => useConnectedDeviceId('audioinput'), {
      wrapper: SuspenseBoundary,
    });

    expect(result.current).toBe(null);

    loadingMediaDevicesDeferred.resolve(mediaDevicesInfo);

    await waitFor(() => {
      expect(result.current).toEqual('audioinput-1');
    });
  });
});

// #region mocks
const clientSdkVideo = vi.hoisted(
  () =>
    ({
      getDevices: () => {
        throw new Error('Not implemented');
      },
      getAudioOutputDevices: () => {
        throw new Error('Not implemented');
      },
    }) as unknown as typeof ClientSdkVideo
);

vi.mock('@vonage/client-sdk-video', (): typeof ClientSdkVideo => {
  return clientSdkVideo;
});

const mediaDevicesInfo = [
  { deviceId: 'audioinput-1', kind: 'audioinput', label: 'Microphone 1' },
] as MediaDeviceInfo[];

const devices = [] as ClientSdkVideo.Device[];
// #endregion
