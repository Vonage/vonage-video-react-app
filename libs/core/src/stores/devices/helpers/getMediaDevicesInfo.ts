import { idempotentCallbackWithRetry } from '@common/execution';

/**
 * Retrieves the list of media devices from the browser.
 */
const getMediaDevicesInfo = async (): Promise<MediaDeviceInfo[]> => {
  /**
   * Some browsers may intermittently fail to return the device list.
   * This function uses a retry mechanism to improve reliability.
   */
  return idempotentCallbackWithRetry(() => navigator.mediaDevices.enumerateDevices(), {
    delayMs: 100,
  });
};

export default getMediaDevicesInfo;
