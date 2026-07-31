import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeniedDevices } from './deviceAccess';
import { DEVICE_KINDS } from './deviceAccess';
import queryDevicePermissionState from './queryDevicePermissionState';
import seedDeniedDevices from './seedDeniedDevices';

/**
 * Resolves the full set of blocked devices for an `accessDenied` event.
 *
 * We seed from the SDK's reported device(s) — the structured `deniedSources` when present, so at
 * least those are always flagged even on browsers whose Permissions API can't be queried — then
 * refine each device with its actual permission state so a still-granted device (the requested-set
 * seed can over-report) is cleared and any second blocked device is caught. The query is
 * authoritative only when definitive: 'prompt' or an unavailable API (Firefox rejects
 * 'camera'/'microphone') keeps the event-message seed.
 */
const detectDeniedDevices = async (event: AccessDeniedEvent): Promise<DeniedDevices> => {
  const denied: DeniedDevices = seedDeniedDevices(event);

  await Promise.all(
    DEVICE_KINDS.map(async (kind) => {
      const state = await queryDevicePermissionState(kind);
      if (state === 'denied') {
        denied[kind] = true;
      } else if (state === 'granted') {
        denied[kind] = false;
      }
    })
  );

  return denied;
};

export default detectDeniedDevices;
