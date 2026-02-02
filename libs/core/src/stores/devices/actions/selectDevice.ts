import { assertMediaDeviceInfo, assertDeviceKind } from '../schemas';
import type { DevicesAPI } from '../types';
import { getMediaDevicesInfo, reconcileSelection } from '../helpers';

/**
 * Selects a media device by kind and deviceId
 */
function selectDevice(
  this: DevicesAPI['actions'],
  kind: MediaDeviceKind,
  deviceId: string | null | undefined
) {
  return async (store: DevicesAPI): Promise<void> => {
    assertDeviceKind(kind);

    // clean up media device
    if (deviceId === null) {
      store.setState((state) => ({
        ...state,
        selection: new Map(state.selection).set(kind, null),
      }));

      return;
    }

    const mediaDeviceInfo = await getMediaDevicesInfo();

    const devicesInfo =
      mediaDeviceInfo.find((device) => device.kind === kind && device.deviceId === deviceId) ??
      null;

    // throw if device not found
    assertMediaDeviceInfo(devicesInfo);

    store.setState((state) => ({
      ...state,
      mediaDeviceInfo,
      selection: new Map(state.selection).set(kind, devicesInfo),
    }));

    reconcileSelection(store);

    await this.syncMediaDevicesInfo();
  };
}

export default selectDevice;
