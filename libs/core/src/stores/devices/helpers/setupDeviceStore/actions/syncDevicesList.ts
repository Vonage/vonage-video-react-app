import CancelablePromise from 'easy-cancelable-promise';
import getDevices from '../../getDevices';
import type { DevicesAPI } from '../../../types';
import type { VonageDevice } from '../../../schemas';

/**
 * Syncs the devices list from Vonage SDK
 */
function syncDevicesList(this: DevicesAPI['actions']) {
  return ({ getMetadata, setState, getState }: DevicesAPI): CancelablePromise<VonageDevice[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingDevices?.cancel();

    meta.loadingDevices = new CancelablePromise<VonageDevice[]>(
      async (resolve, _, { isPending }) => {
        const devices = await getDevices();

        // promise was cancelled
        if (!isPending()) return;

        setState({
          ...getState(),
          devices,
        });

        resolve(devices);
      }
    );

    return meta.loadingDevices;
  };
}

export default syncDevicesList;
