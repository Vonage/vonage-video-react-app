import getDevices from '../helpers/getDevices';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';

export type DevicesApi = import('../DevicesContext').DevicesApi;

/**
 * Device store that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 */
function updateMediaDevices(this: DevicesApi['actions']) {
  return async ({ getMetadata, setState, getState }: DevicesApi): Promise<void> => {
    const meta = getMetadata();

    // If there is an ongoing update queue the next update so the last call doesn't get overridden
    if (meta.updateMediaDevices) {
      return meta.updateMediaDevices.then(() => this.updateMediaDevices());
    }

    const loadDevices = () => {
      return (meta.loadingDevices = getDevices().then((devices) => {
        meta.loadingDevices = null;

        setState({
          ...getState(),
          devices,
        });

        return devices;
      }));
    };

    const loadAudioOutputDevices = () => {
      return (meta.loadingAudioOutputDevices = getAudioOutputDevices().then(
        (audioOutputDevices) => {
          meta.loadingAudioOutputDevices = null;

          setState({
            ...getState(),
            audioOutputDevices,
          });

          return audioOutputDevices;
        }
      ));
    };

    const loadMediaDevices = () => {
      return (meta.loadingMediaDevices = navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          meta.mediaDevices = devices;
          meta.loadingMediaDevices = null;

          return devices;
        }));
    };

    await (meta.updateMediaDevices = Promise.all([
      loadDevices(),
      loadAudioOutputDevices(),
      loadMediaDevices(),
    ]).then(() => {
      meta.updateMediaDevices = null;
    }));
  };
}

export default updateMediaDevices;
