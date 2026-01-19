import { CancelablePromise } from 'easy-cancelable-promise';
import { getMediaDevicesInfo, reconcileSelection } from '../helpers';
import type { DevicesAPI } from '../types';

/**
 * Sets the audio output device by its device ID.
 */
function syncMediaDevicesInfo(this: DevicesAPI['actions']) {
  return async (store: DevicesAPI): Promise<MediaDeviceInfo[]> => {
    const meta = store.getMetadata();

    // cancel ongoing update
    meta.loadingMediaDevices?.cancel();

    meta.loadingMediaDevices = new CancelablePromise<MediaDeviceInfo[]>(
      async (resolve, _, { isPending }) => {
        const mediaDeviceInfo = await getMediaDevicesInfo();

        // promise was cancelled
        if (!isPending()) return;

        store.setState((state) => ({
          ...state,
          mediaDeviceInfo,
        }));

        await reconcileSelection(store);

        resolve(mediaDeviceInfo);
      }
    );

    return meta.loadingMediaDevices;
  };
}

export default syncMediaDevicesInfo;
