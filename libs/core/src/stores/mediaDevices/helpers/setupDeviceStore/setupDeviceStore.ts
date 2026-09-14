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

  // Do NOT acquire media here: this runs at store init (i.e. on the landing page). On Firefox
  // that would light the camera LED before it is needed. Revealing device labels on Firefox is
  // deferred to the requestDeviceLabels action, called when media is actually required (e.g. the
  // Waiting Room). See https://github.com/Vonage/vonage-video-react-app/issues/723.
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
