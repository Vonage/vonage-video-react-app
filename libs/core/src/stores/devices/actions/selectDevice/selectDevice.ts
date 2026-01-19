import type { DevicesAPI } from '../../types';
import { getMediaDevicesInfo, reviseMediaSelection } from '../../helpers';
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

    const meta = store.getMetadata();

    /**
     * This is to prevent the super rare edge case where there could be an ongoing sync at the same time the user selects a device.
     * In that case the easiest approach will be to wait for the ongoing sync to finish before continuing with the new reconciliation
     */
    const mediaDeviceInfo = await (async () => {
      if (meta.loadingMediaDevices?.status === 'pending') {
        await meta.loadingMediaDevices;
      }

      return getMediaDevicesInfo();
    })();

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
  };
}

export default selectDevice;
