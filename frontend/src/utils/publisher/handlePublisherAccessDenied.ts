import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import getDeniedDevice from './getDeniedDevice';

/**
 * Handles publisher access denied events
 * Monitors device permission changes and updates access status accordingly
 */
const handlePublisherAccessDenied = async (
  event: AccessDeniedEvent,
  setAccessStatus: (status: string) => void
) => {
  const deviceDeniedAccess = getDeniedDevice(event.message);

  setAccessStatus(DEVICE_ACCESS_STATUS.REJECTED);

  try {
    const permissionStatus = await window.navigator.permissions.query({
      name: deviceDeniedAccess,
    });
    permissionStatus.onchange = () => {
      if (permissionStatus.state === 'granted') {
        setAccessStatus(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
      }
    };
  } catch (error) {
    console.error(`Failed to query device permission for ${deviceDeniedAccess}: ${error}`);
  }
};

export default handlePublisherAccessDenied;
