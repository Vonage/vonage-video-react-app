import { idempotentCallbackWithRetry } from '@common/execution';
import type { MediaDeviceInfoJSON } from '@web/types';
import { DevicesAPI } from '../types';
import { actions } from 'react-global-state-hooks';
/**
 * Retrieves the list of media devices from the browser.
 */
const getMediaDevicesInfo$ = actions<DevicesAPI>()({
  getMediaDevicesInfo() {
    return ({ getMetadata }): Promise<MediaDeviceInfoJSON[]> => {
      const { isStoreReady } = getMetadata();

      /**
       * Some browsers may intermittently fail to return the device list.
       * This function uses a retry mechanism to improve reliability.
       */
      return idempotentCallbackWithRetry(
        async () => {
          // Wait for permissions to be resolved before querying devices, as some browsers (e.g., Firefox) require permissions to be granted before providing device labels and IDs.
          await isStoreReady;

          // Convert MediaDeviceInfo objects to plain JSON-serializable objects
          // native MediaDeviceInfo objects have methods and properties that may not be serializable, or work well when destructured,
          // so we create plain objects with the same properties.
          return navigator.mediaDevices.enumerateDevices().then((devices) =>
            devices
              .map((device) => ({
                deviceId: device.deviceId,
                kind: device.kind,
                label: device.label,
                groupId: device.groupId,
              }))
              // In case there are remaining devices without deviceId
              .filter((device) => device.deviceId)
          );
        },
        {
          delayMs: 100,
        }
      );
    };
  },
});

export default getMediaDevicesInfo$;
