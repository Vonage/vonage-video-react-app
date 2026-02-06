import type { DevicesAPI } from '../types';
import { getMediaDevicesInfo } from '../helpers';
import { assertDeviceKind, assertMediaDeviceInfo } from '@common/schemas';

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
        [kind]: undefined,
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
      [kind]: devicesInfo.deviceId,
    }));

    await this.syncMediaDevicesInfo();
  };
}

export default selectDevice;
