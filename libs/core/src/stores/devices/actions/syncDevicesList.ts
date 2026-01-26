import CancelablePromise from 'easy-cancelable-promise';
import getDevices from '../helpers/getDevices';
import type { Device } from '../schemas';

export type DevicesApi = import('../DevicesStore').DevicesApi;

/**
 * Syncs the devices list from Vonage SDK
 */
function syncDevicesList(this: DevicesApi['actions']) {
  return ({ getMetadata, setState, getState }: DevicesApi): CancelablePromise<Device[]> => {
    const meta = getMetadata();

    // cancel ongoing update
    meta.loadingDevices?.cancel();

    meta.loadingDevices = new CancelablePromise<Device[]>(async (resolve, _, { isPending }) => {
      const devices = await getDevices();

      // promise was cancelled
      if (!isPending()) return;

      setState({
        ...getState(),
        devices,
      });

      resolve(devices);
    });

    return meta.loadingDevices;
  };
}

export default syncDevicesList;
