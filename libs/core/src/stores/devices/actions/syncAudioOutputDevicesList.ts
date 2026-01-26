import CancelablePromise from 'easy-cancelable-promise';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';
import type { DevicesApiPrivate, AudioOutputDevice } from '../types';
import attempt from '@common/execution/attempt';

/**
 * Syncs the audio output devices list and tries to restore the previous selected audio output device
 */
function syncAudioOutputDevicesList(this: DevicesApiPrivate['actions']) {
  return ({
    getMetadata,
    setState,
    getState,
  }: DevicesApiPrivate): CancelablePromise<AudioOutputDevice[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingAudioOutputDevices?.cancel();

    // we use a cancelable promise to avoid render a discarded audio output devices list
    meta.loadingAudioOutputDevices = new CancelablePromise<AudioOutputDevice[]>(
      async (resolve, _, { isPending }) => {
        const devices = await getAudioOutputDevices();

        // promise was cancelled
        if (!isPending()) return;

        setState({
          ...getState(),
          audioOutputDevices: devices,
        });

        const tryToRestoreSelection = () => {
          const { selectedAudioOutput } = getState();

          return this.setAudioOutputDevice(selectedAudioOutput?.deviceId);
        };

        const fallbackToDefault = () => {
          if (!isPending()) return;

          const deviceId =
            devices.find((device) => device.deviceId === 'default')?.deviceId ?? null;

          return this.setAudioOutputDevice(deviceId);
        };

        // tries to restore previous selected audio output device
        await attempt(tryToRestoreSelection, fallbackToDefault);

        resolve(devices);
      }
    );

    return meta.loadingAudioOutputDevices;
  };
}

export default syncAudioOutputDevicesList;
