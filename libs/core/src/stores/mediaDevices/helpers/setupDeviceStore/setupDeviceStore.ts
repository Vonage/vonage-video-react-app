import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';
import debounce from '@common/execution/debounce';
import { assertDevicesAPI } from '../../assertions';
import { attempt } from '@common/execution';
import CancelablePromise from 'easy-cancelable-promise';
import { mediaDevicesEnvelop } from '@core/interceptors';

/**
 * Avoid monkey patching getUserMedia in non browser environment, like test or server side rendering
 */
const isBrowserEnvironment = Boolean(globalThis.navigator.mediaDevices?.addEventListener);

/**
 * Pull devices lists and try to restore previous selected devices
 */
function setupDeviceStore(api: unknown) {
  assertDevicesAPI(api);

  const getUserMedia = mediaDevicesEnvelop.getOriginal('getUserMedia');

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener || !getUserMedia) {
    return;
  }

  const meta = api.getMetadata();
  const shouldMonkeyPatchGetUserMedia = isBrowserEnvironment && getUserMedia;

  const abortController = new AbortController();

  meta.isFirstMediaDevicesInfoQuery = true;

  void attempt(() => {
    void setVonageAudioOutputDevice(api.getState().audiooutput!);
  });

  const syncMediaDevicesInfoDebounced = debounce(async () => {
    await meta.isStoreReady;

    void api.actions.syncMediaDevicesInfo().catch(() => {});
  }, 10);

  // Populate the device list without requesting permissions. On Firefox this means device *labels*
  // stay hidden until the user grants access — we deliberately do NOT force a getUserMedia here.
  // That eager call used to run at store construction (app boot), popping a camera/mic prompt on
  // every page including the landing page. Labels are unlocked lazily instead: when a publisher
  // actually acquires media in the waiting/meeting room, the SDK's getUserMedia is routed through
  // this store's getUserMedia action (see the monkey-patch below), which resyncs the device info —
  // and therefore the labels — on grant.
  meta.isStoreReady = new CancelablePromise((resolve, reject) => {
    void api.actions
      .syncMediaDevicesInfo()
      .then(() => {
        resolve();
      })
      .catch(reject);
  });

  abortController.signal.addEventListener('abort', () => {
    void meta.isStoreReady.cancel(new Error('permissions request cancelled due to store cleanup'));
  });

  // listen for permission changes to resync devices when granted
  void Promise.allSettled(
    (['camera', 'microphone'] as const).map(async (name) => {
      return navigator.permissions?.query({ name }).then((status) => {
        status.addEventListener(
          'change',
          () => {
            syncMediaDevicesInfoDebounced();
          },
          abortController
        );

        return status;
      });
    })
  );

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener(
    'devicechange',
    () => {
      syncMediaDevicesInfoDebounced();
    },
    abortController
  );

  // resync devices when tab becomes visible
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'visible') {
        syncMediaDevicesInfoDebounced();
      }
    },
    abortController
  );

  /**
   * Restore the original getUserMedia function.
   */
  const restoreMonkeyPatch = (() => {
    if (!shouldMonkeyPatchGetUserMedia) return () => {};

    return mediaDevicesEnvelop.override('getUserMedia', () => api.actions.getUserMedia);
  })();

  return () => {
    abortController.abort();
    restoreMonkeyPatch();
  };
}

export default setupDeviceStore;
