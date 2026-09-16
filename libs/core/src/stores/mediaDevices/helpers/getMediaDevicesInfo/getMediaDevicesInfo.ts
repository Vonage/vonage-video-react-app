import { idempotentCallbackWithRetry } from '@common/execution';
import type { MediaDeviceInfoJSON } from '@web/types';
import { DevicesAPI } from '../../types';
import { actions } from 'react-global-state-hooks';
import { FacingMode } from '@common/types';
import { frontFacingKeywords, rearFacingKeywords } from '../../constants';
import { isMobile } from '@web/platform';

/**
 * Retrieves the list of media devices from the browser.
 */
const getMediaDevicesInfo$ = actions<DevicesAPI>()({
  getMediaDevicesInfo() {
    return ({ getMetadata }): Promise<MediaDeviceInfoJSON[]> => {
      const metadata = getMetadata();
      const shouldSkipStoreReady = metadata.isFirstMediaDevicesInfoQuery;

      metadata.isFirstMediaDevicesInfoQuery = false;

      /**
       * Some browsers may intermittently fail to return the device list.
       * This function uses a retry mechanism to improve reliability.
       */
      return idempotentCallbackWithRetry(
        async () => {
          // Wait for permissions to be resolved before querying devices, as some browsers (e.g., Firefox) require permissions to be granted before providing device labels and IDs.
          if (!shouldSkipStoreReady) {
            await metadata.isStoreReady;
          }

          // Convert MediaDeviceInfo objects to plain JSON-serializable objects
          // native MediaDeviceInfo objects have methods and properties that may not be serializable, or work well when destructured,
          // so we create plain objects with the same properties.
          return navigator.mediaDevices.enumerateDevices().then((devices) =>
            devices
              // In case there are remaining devices without deviceId
              .filter((device) => device.deviceId)
              .map(
                (device): MediaDeviceInfoJSON => ({
                  deviceId: device.deviceId,
                  kind: device.kind,
                  label: device.label,
                  groupId: device.groupId,
                  inferredFacingMode: inferFacingModeFromLabel({ device }),
                })
              )
          );
        },
        {
          delayMs: 100,
        }
      );
    };
  },
});

function inferFacingModeFromLabel({ device }: { device: MediaDeviceInfo }): FacingMode | null {
  const shouldInferFacingMode = isMobile() && device.kind === 'videoinput' && device.label;
  if (!shouldInferFacingMode) return null;

  const label = device.label.toLowerCase();

  if (frontFacingKeywords.some((keyword) => label.includes(keyword))) {
    return FacingMode.user;
  }

  if (rearFacingKeywords.some((keyword) => label.includes(keyword))) {
    return FacingMode.environment;
  }

  return FacingMode.unknown;
}

export default getMediaDevicesInfo$;
