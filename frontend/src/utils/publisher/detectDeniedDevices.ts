import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeniedDevices, DeviceKind } from './deviceAccess';
import seedDeniedDevices from './seedDeniedDevices';

const DEVICE_KINDS: DeviceKind[] = ['microphone', 'camera'];

/**
 * Resolves the full set of blocked devices for an `accessDenied` event.
 *
 * We seed from the SDK's reported device(s) — the structured `deniedSources` when present, so at
 * least those are always flagged even on browsers whose Permissions API can't be queried — then
 * refine each device with its actual permission state so a still-granted device (the requested-set
 * seed can over-report) is cleared and any second blocked device is caught.
 */
const detectDeniedDevices = async (event: AccessDeniedEvent): Promise<DeniedDevices> => {
  const denied: DeniedDevices = seedDeniedDevices(event);

  await Promise.all(
    DEVICE_KINDS.map(async (kind) => {
      try {
        const status = await window.navigator.permissions.query({ name: kind as PermissionName });
        // Authoritative when definitive: corrects a mis-seed so a still-granted device (e.g. a
        // camera when only the mic was revoked) is never flagged. 'prompt' keeps the seed.
        if (status.state === 'denied') {
          denied[kind] = true;
        } else if (status.state === 'granted') {
          denied[kind] = false;
        }
      } catch {
        // Firefox rejects 'camera'/'microphone' as PermissionName — keep the event-message seed.
      }
    })
  );

  return denied;
};

export default detectDeniedDevices;
