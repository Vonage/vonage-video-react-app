import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeniedDevices } from './deviceAccess';
import { NO_DENIED_DEVICES } from './deviceAccess';
import getDeniedDevice from './getDeniedDevice';

/**
 * Initial blocked-device guess for an `accessDenied` event, before the authoritative
 * Permissions API refinement runs.
 *
 * Prefers the SDK's structured `deniedSources`, which can name more than one device (e.g. both
 * camera and microphone requested when joining) and never misattributes. Falls back to parsing the
 * free-text message for a single device only when running against an SDK build that predates
 * `deniedSources`.
 */
const seedDeniedDevices = (event: AccessDeniedEvent): DeniedDevices => {
  const sources = event.deniedSources;
  if (sources && sources.length > 0) {
    return {
      microphone: sources.includes('microphone'),
      camera: sources.includes('camera'),
    };
  }

  return { ...NO_DENIED_DEVICES, [getDeniedDevice(event.message)]: true };
};

export default seedDeniedDevices;
