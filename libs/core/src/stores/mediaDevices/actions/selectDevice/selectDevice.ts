import type { DevicesAPI } from '../../types';
import { getMediaDevicesInfo$ } from '../../helpers';
import { assertDeviceKind, assertMediaDeviceInfo } from '@web/schemas';
import assertMediaStreamAccess from '../../helpers/assertMediaStreamAccess';
import isSinkIdSupported from '@web/platform/isSinkIdSupported/isSinkIdSupported';
import { attempt } from '@common/execution';
import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';

/**
 * Selects a media device by kind and deviceId
 */
function selectDevice(
  this: DevicesAPI['actions'],
  kind: MediaDeviceKind,
  deviceId: string | undefined
) {
  return async (store: DevicesAPI): Promise<void> => {
    assertDeviceKind(kind);

    if (!deviceId) {
      store.setState((state) => ({
        ...state,
        [kind]: undefined,
      }));

      return;
    }

    const meta = store.getMetadata();
    const { getMediaDevicesInfo } = getMediaDevicesInfo$(store);

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

    assertMediaDeviceInfo(devicesInfo);

    if (kind !== 'audiooutput') await assertMediaStreamAccess(devicesInfo);

    // reconcile audio output device with Vonage SDK if it changed
    if (kind === 'audiooutput' && isSinkIdSupported()) {
      // if the audio device changed, reconcileSelection with Vonage SDK
      attempt(() => setVonageAudioOutputDevice(deviceId));
    }

    store.setState((state) => ({
      ...state,
      [kind]: deviceId,
    }));
  };
}

export default selectDevice;
