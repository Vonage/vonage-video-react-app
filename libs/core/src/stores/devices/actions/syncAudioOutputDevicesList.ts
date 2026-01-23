import CancelablePromise from 'easy-cancelable-promise';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';
import type { AudioOutputDevice } from '../types';

export type DevicesApi = import('../DevicesStore').DevicesApi;

/**
 * Syncs the audio output devices list
 */
function syncAudioOutputDevicesList(this: DevicesApi['actions']) {
  return ({
    getMetadata,
    setState,
    getState,
  }: DevicesApi): CancelablePromise<AudioOutputDevice[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingAudioOutputDevices?.cancel();

    // we use a cancelable promise to avoid render a discarded audio output devices list
    meta.loadingAudioOutputDevices = new CancelablePromise<AudioOutputDevice[]>(
      async (resolve, _, { isPending }) => {
        const audioOutputDevices = await getAudioOutputDevices();

        // promise was cancelled
        if (!isPending()) return;

        setState({
          ...getState(),
          audioOutputDevices,
        });

        resolve(audioOutputDevices);
      }
    );

    return meta.loadingAudioOutputDevices;
  };
}

export default syncAudioOutputDevicesList;
