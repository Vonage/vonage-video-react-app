import CancelablePromise from 'easy-cancelable-promise';
import { attempt } from 'lodash';
import type { DevicesAPI, NativeMediaDeviceInfo } from '../../../types';
import getMediaDevices from '../../getMediaDevices';

/**
 * Syncs the native NativeMediaDeviceInfo list from navigator.mediaDevices
 */
function syncMediaDevicesList(this: DevicesAPI['actions']) {
  return ({
    getMetadata,
    setState,
    getState,
  }: DevicesAPI): CancelablePromise<NativeMediaDeviceInfo[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingMediaDevices?.cancel();

    meta.loadingMediaDevices = new CancelablePromise<NativeMediaDeviceInfo[]>(
      async (resolve, _, { isPending }) => {
        const devices = await getMediaDevices();

        // promise was cancelled
        if (!isPending()) return;

        setState((state) => ({
          ...state,
          mediaDevices: devices,
        }));

        const tryToRestoreSelection = () => {
          const { selectedAudioOutput } = getState();

          return this.setAudioOutputDevice(selectedAudioOutput?.deviceId);
        };

        const fallbackToDefault = () => {
          if (!isPending()) return;

          const deviceId =
            devices.find((device) => device.deviceId === 'default')?.deviceId ?? null;

          return this.setMediaDevice(deviceId);
        };

        // tries to restore previous selected audio output device
        await attempt(tryToRestoreSelection, fallbackToDefault);

        resolve(devices);
      }
    );

    return meta.loadingMediaDevices;
  };
}

export default syncMediaDevicesList;
