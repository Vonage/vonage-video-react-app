import { CancelablePromise } from 'easy-cancelable-promise';
import { getMediaDevicesInfo$, reviseMediaSelection } from '../helpers';
import type { DevicesAPI } from '../types';
import type { MediaDeviceInfoJSON } from '@web/types';
import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';
import { attempt } from '@common/execution';
import { isSinkIdSupported } from '@web/platform';

/**
 * Syncs the media devices info by fetching the latest media devices and updating the store state.
 * It also checks if the current selected devices are still valid with the new media devices info and updates the selection if necessary.
 */
function syncMediaDevicesInfo(this: DevicesAPI['actions']) {
  return async (store: DevicesAPI): Promise<MediaDeviceInfoJSON[]> => {
    const meta = store.getMetadata();
    const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

    // cancel ongoing update
    void meta.loadingMediaDevices?.cancel();

    meta.loadingMediaDevices = new CancelablePromise<MediaDeviceInfoJSON[]>(
      async (resolve, reject, { isCanceled }) => {
        try {
          const mediaDeviceInfo = await getMediaDevicesInfo();

          if (isCanceled()) return;

          store.setState((state) => ({
            ...state,
            mediaDeviceInfo,
          }));

          const state = store.getState();

          const updates = reviseMediaSelection(state);

          if (updates) {
            store.setState((state) => ({
              ...state,
              ...updates,
            }));
          }

          // reconcile audio output device with Vonage SDK if it changed
          if (updates?.audiooutput && isSinkIdSupported()) {
            // if the audio device changed, reconcileSelection with Vonage SDK
            attempt(() => setVonageAudioOutputDevice(updates.audiooutput!));
          }

          resolve(mediaDeviceInfo);
        } catch (error) {
          reject(error ?? new Error('Failed to sync media devices info'));
        }
      }
    );

    return meta.loadingMediaDevices;
  };
}

export default syncMediaDevicesInfo;
