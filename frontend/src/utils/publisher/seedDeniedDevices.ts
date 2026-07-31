import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeniedDevices } from './deviceAccess';

/**
 * Initial blocked-device guess for an `accessDenied` event, before the authoritative Permissions API
 * refinement runs.
 *
 * Prefers the SDK's structured `deniedSources`, which can name more than one device (e.g. both camera
 * and microphone requested at join) and never flags the wrong one.
 *
 * When running against an SDK build without `deniedSources`, it parses the free-text message:
 *  - A MID-CALL denial names its device ("microphone permission denied during the call"), so seed
 *    just that one.
 *  - An INIT/join denial reports the generic literal "device" ("device permission denied while
 *    initializing") — the SDK can't say which requested device failed — so seed BOTH conservatively.
 *    A combined getUserMedia fails wholesale, so at least one (usually both) of the requested devices
 *    is denied; the authoritative `permissions.query` (Chrome) and the per-device re-grant watchers
 *    refine this immediately, and on Safari/Firefox — where the query is unavailable — badging both is
 *    safer than guessing one device and silently leaving the other denied. (Matches the semantics of
 *    the patched-SDK `deniedSources`, which reports the whole requested source set.)
 */
const seedDeniedDevices = (event: AccessDeniedEvent): DeniedDevices => {
  const sources = event.deniedSources;
  if (sources && sources.length > 0) {
    return {
      microphone: sources.includes('microphone'),
      camera: sources.includes('camera'),
    };
  }

  const message = event.message?.toLowerCase() ?? '';
  if (message.startsWith('microphone')) {
    return { microphone: true, camera: false };
  }
  if (message.startsWith('camera')) {
    return { microphone: false, camera: true };
  }
  return { microphone: true, camera: true };
};

export default seedDeniedDevices;
