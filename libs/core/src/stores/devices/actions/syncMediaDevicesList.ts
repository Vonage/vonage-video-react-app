import CancelablePromise from 'easy-cancelable-promise';

export type DevicesApi = import('../DevicesStore').DevicesApi;

/**
 * Syncs the native MediaDeviceInfo list from navigator.mediaDevices
 */
function syncMediaDevicesList(this: DevicesApi['actions']) {
  return ({ getMetadata, setState }: DevicesApi): CancelablePromise<MediaDeviceInfo[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingMediaDevices?.cancel();

    meta.loadingMediaDevices = new CancelablePromise<MediaDeviceInfo[]>(
      async (resolve, _, { isPending }) => {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();

        // promise was cancelled
        if (!isPending()) return;

        setState((state) => ({
          ...state,
          mediaDevices,
        }));

        resolve(mediaDevices);
      }
    );

    return meta.loadingMediaDevices;
  };
}

export default syncMediaDevicesList;
