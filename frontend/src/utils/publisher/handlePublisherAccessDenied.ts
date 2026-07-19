import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import type { DeniedDevices, DeviceKind } from './deviceAccess';
import seedDeniedDevices from './seedDeniedDevices';

const DEVICE_KINDS: DeviceKind[] = ['microphone', 'camera'];

/**
 * Handles publisher `accessDenied` events for the preview (waiting room) publisher.
 *
 * It reports which specific device(s) are blocked so the UI can name them (Google Meet
 * style), and watches each blocked device's permission so that when the user re-grants
 * access we surface {@link DEVICE_ACCESS_STATUS.ACCESS_CHANGED}. The waiting room reacts to
 * that by re-initializing the publisher in place — no page reload.
 */
const handlePublisherAccessDenied = async ({
  event,
  setAccessStatus,
  onDeniedDevicesChange,
}: {
  event: AccessDeniedEvent;
  setAccessStatus: (status: string) => void;
  onDeniedDevicesChange?: (denied: DeniedDevices) => void;
}): Promise<void> => {
  setAccessStatus(DEVICE_ACCESS_STATUS.REJECTED);

  // Seed from the device(s) the SDK reported (structured `deniedSources` when present) so we always
  // flag at least those, even in browsers where the Permissions API can't be queried (e.g. Firefox).
  const denied: DeniedDevices = seedDeniedDevices(event);

  const report = () => onDeniedDevicesChange?.({ ...denied });

  await Promise.all(
    DEVICE_KINDS.map(async (kind) => {
      const permissionStatus = await queryDevicePermission(kind);
      if (!permissionStatus) {
        return;
      }

      // The permission query is authoritative when it gives a definitive answer: it corrects a
      // mis-seed (e.g. a mic-only denial whose message defaulted `getDeniedDevice` to 'camera')
      // so a still-granted device is never flagged. Only 'prompt'/unavailable keeps the seed.
      if (permissionStatus.state === 'denied') {
        denied[kind] = true;
      } else if (permissionStatus.state === 'granted') {
        denied[kind] = false;
      }

      permissionStatus.onchange = () => {
        if (permissionStatus.state !== 'granted') {
          return;
        }
        denied[kind] = false;
        report();
        setAccessStatus(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
      };
    })
  );

  report();
};

async function queryDevicePermission(kind: DeviceKind): Promise<PermissionStatus | null> {
  try {
    return await window.navigator.permissions.query({ name: kind as PermissionName });
  } catch {
    // Firefox rejects 'camera'/'microphone' as PermissionName; fall back to event-message seeding.
    return null;
  }
}

export default handlePublisherAccessDenied;
