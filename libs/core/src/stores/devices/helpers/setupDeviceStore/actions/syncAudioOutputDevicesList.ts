import type { AudioOutputDevice, DevicesAPI } from '../../../types';
import type { SetupAPI } from '../types';
import attempt from '@common/execution/attempt';
import CancelablePromise from 'easy-cancelable-promise';
import getAudioOutputDevices from '../../getAudioOutputDevices';

/**
 * Syncs the audio output devices list and tries to restore the previous selected audio output device
 */
function syncAudioOutputDevicesList(this: SetupAPI) {
  return ({
    getMetadata,
    setState,
    getState,
    actions,
  }: DevicesAPI): CancelablePromise<AudioOutputDevice[]> => {
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

          return actions.setAudioOutputDevice(selectedAudioOutput?.deviceId);
        };

        const fallbackToDefault = () => {
          if (!isPending()) return;

          const deviceId =
            devices.find((device) => device.deviceId === 'default')?.deviceId ?? null;

          return actions.setAudioOutputDevice(deviceId);
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
