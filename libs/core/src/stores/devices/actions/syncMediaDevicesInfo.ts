import { CancelablePromise } from 'easy-cancelable-promise';
import { getMediaDevicesInfo, reviseMediaSelection } from '../helpers';
import type { DevicesAPI } from '../types';
import type { MediaDeviceInfoJSON } from '@common/types';

/**
 * Sets the audio output device by its device ID.
 */
function syncMediaDevicesInfo(this: DevicesAPI['actions']) {
  return async (store: DevicesAPI): Promise<MediaDeviceInfoJSON[]> => {
    const meta = store.getMetadata();

    // cancel ongoing update
    meta.loadingMediaDevices?.cancel();

    meta.loadingMediaDevices = new CancelablePromise<MediaDeviceInfoJSON[]>(
      async (resolve, reject, { isPending }) => {
        try {
          const mediaDeviceInfo = await getMediaDevicesInfo();

          // promise was cancelled
          if (!isPending()) return;

          store.setState((state) => ({
            ...state,
            mediaDeviceInfo,
          }));

          // every time the media devices info is synced we should reconcile the current selection with the available devices and update if necessary.
          const [videoStream, audioStream] = await Promise.all([
            navigator.mediaDevices
              .getUserMedia({
                video: true,
              })
              .catch((error) => {
                store.setState((state) => ({
                  ...state,
                  videoinput: undefined,
                }));

                throw error;
              }),
            navigator.mediaDevices
              .getUserMedia({
                audio: true,
              })
              .catch((error) => {
                store.setState((state) => ({
                  ...state,
                  audioinput: undefined,
                }));

                throw error;
              }),
          ]);

          reviseMediaSelection({ videoStream, audioStream, store });

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
