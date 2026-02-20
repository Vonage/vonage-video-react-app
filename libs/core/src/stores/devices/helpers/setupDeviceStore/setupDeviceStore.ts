import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';
import debounce from '@common/execution/debounce';
import { assertDevicesAPI } from '../../assertions';
import { attempt } from '@common/execution';
import isFirefox from '@web/platform/isFirefox';
import CancelablePromise from 'easy-cancelable-promise';

/**
 * Avoid monkey patching getUserMedia in non browser environment, like test or server side rendering
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

  const meta = api.getMetadata();
  const __getUserMedia = globalThis.navigator.mediaDevices.getUserMedia;
  const shouldMonkeyPatchGetUserMedia = isBrowserEnvironment && __getUserMedia;

  const abortController = new AbortController();

  void attempt(() => {
    void setVonageAudioOutputDevice(api.getState().audiooutput!);
  });

  const syncMediaDevicesInfoDebounced = debounce(async () => {
    await meta.permissionsRequests;

    void api.actions.syncMediaDevicesInfo().catch(() => {});
  }, 10);

  meta.permissionsRequests = new CancelablePromise((resolve, reject, { isCanceled }) => {
    if (!isFirefox()) return resolve();

    void navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (isCanceled()) return;

        const hasLabels = devices.some((device) => device.label);
        if (hasLabels) return;

        //we should request permissions to be able to see the devices labels.
        return navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
      })
      .then(resolve)
      .catch(reject);
  });

  abortController.signal.addEventListener('abort', () => {
    void meta.permissionsRequests.cancel(
      new Error('permissions request cancelled due to store cleanup')
    );
  });

  void meta.permissionsRequests.then(() => {
    syncMediaDevicesInfoDebounced();
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

  // make accessible to the actions the vanilla getUserMedia function
  meta.__getUserMedia = __getUserMedia.bind(navigator.mediaDevices);

  /**
   * Restore the original getUserMedia function.
   */
  const __restoreMonkeyPatch = () => {
    if (!isBrowserEnvironment) return;
    globalThis.navigator.mediaDevices.getUserMedia = __getUserMedia;
  };

  /**
   * Monkey patch navigator.mediaDevices.getUserMedia to keep the store in sync when it's called outside of the store's getUserMedia action.
   */
  if (shouldMonkeyPatchGetUserMedia) {
    globalThis.navigator.mediaDevices.getUserMedia = Object.assign(api.actions.getUserMedia, {
      __restoreMonkeyPatch,
    });
  }

  return () => {
    abortController.abort();
    __restoreMonkeyPatch();
  };
}

export default setupDeviceStore;
