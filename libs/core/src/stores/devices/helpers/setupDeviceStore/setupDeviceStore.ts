import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';
import debounce from '@common/execution/debounce';
import { assertDevicesAPI } from '../../assertions';
import { attempt } from '@common/execution';

/**
 * Avoid money patching getUserMedia in non browser environment, like test or server side rendering
 */
const isBrowserEnvironment = Boolean(globalThis.navigator.mediaDevices?.addEventListener);

/**
 * Pull devices lists and try to restore previous selected devices
 */
function setupDeviceStore(api: unknown) {
  assertDevicesAPI(api);

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener) {
    return;
  }

  const abortController = new AbortController();

  void attempt(() => {
    void setVonageAudioOutputDevice(api.getState().audiooutput!);
  });

  const syncMediaDevicesInfoDebounced = debounce(() => {
    void api.actions.syncMediaDevicesInfo().catch(() => {});
  }, 10);

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
      });
    })
  ).finally(() => {
    syncMediaDevicesInfoDebounced();
  });

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
        void api.actions.syncMediaDevicesInfo();
      }
    },
    abortController
  );

  const meta = api.getMetadata();
  const __getUserMedia = globalThis.navigator.mediaDevices.getUserMedia;
  const shouldMonkeyPatchGetUserMedia = isBrowserEnvironment && __getUserMedia;

  // make accessible to the actions the vanilla getUserMedia function
  meta.__getUserMedia = __getUserMedia.bind(navigator.mediaDevices);

  /**
   * Restore the original getUserMedia function.
   */
  const __restoreMonkeyPath = () => {
    if (!isBrowserEnvironment) return;
    globalThis.navigator.mediaDevices.getUserMedia = __getUserMedia;
  };

  /**
   * Monkey patch navigator.mediaDevices.getUserMedia to keep the store in sync when it's called outside of the store's getUserMedia action.
   */
  if (shouldMonkeyPatchGetUserMedia) {
    globalThis.navigator.mediaDevices.getUserMedia = Object.assign(api.actions.getUserMedia, {
      __restoreMonkeyPath,
    });
  }

  return () => {
    abortController.abort();
    __restoreMonkeyPath();
  };
}

export default setupDeviceStore;
