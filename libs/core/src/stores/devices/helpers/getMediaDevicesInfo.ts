import { idempotentCallbackWithRetry } from '@common/execution';
import type { MediaDeviceInfoJSON } from '@common/types';

/**
 * Retrieves the list of media devices from the browser.
 */
const getMediaDevicesInfo = async (): Promise<MediaDeviceInfoJSON[]> => {
  /**
   * Some browsers may intermittently fail to return the device list.
   * This function uses a retry mechanism to improve reliability.
   */
  return idempotentCallbackWithRetry(
    () =>
      // Convert MediaDeviceInfo objects to plain JSON-serializable objects
      // native MediaDeviceInfo objects have methods and properties that may not be serializable, or work well when destructured,
      // so we create plain objects with the same properties.
      navigator.mediaDevices.enumerateDevices().then((devices) =>
        devices.map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label,
          groupId: device.groupId,
        }))
      ),
    {
      delayMs: 100,
    }
  );
};

export default getMediaDevicesInfo;
