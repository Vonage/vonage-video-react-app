import createGlobalState, { type InferStateApi } from 'react-global-state-hooks/createGlobalState';
import { Device, AudioOutputDevice } from '@vonage/client-sdk-video';
import getConnectedDeviceId from './actions/getConnectedDeviceId';
import updateMediaDevices from './actions/updateMediaDevices';

const initialValue = {
  devices: [] as Device[],
  audioOutputDevices: [] as AudioOutputDevice[],
};

const metadata = {
  loadingDevices: null as null | Promise<typeof initialValue.devices>,
  loadingAudioOutputDevices: null as null | Promise<typeof initialValue.audioOutputDevices>,

  /**
   * MediaDevices doesn't need to be reactive, so we keep it in metadata
   */
  mediaDevices: [] as MediaDeviceInfo[],
  loadingMediaDevices: null as null | Promise<MediaDeviceInfo[]>,

  updateMediaDevices: null as null | Promise<void>,
};

/**
 * [TODO]: For easy testing is better to use context but it will require more refactor... We'll take care of it later.
 */
const devices$ = createGlobalState(initialValue, {
  metadata,
  actions: {
    getConnectedDeviceId,
    updateMediaDevices,
  },
  callbacks: {
    onInit: ({ actions }) => {
      const { mediaDevices } = globalThis.navigator;
      if (!mediaDevices || !mediaDevices.addEventListener) {
        console.warn('enumerateDevices() not supported.');
        return;
      }

      // keep all devices updated on devicechange event
      mediaDevices.addEventListener('devicechange', actions.updateMediaDevices);

      // Initial load
      void actions.updateMediaDevices();
    },
  },
});

export type DevicesApi = InferStateApi<typeof devices$>;

export default devices$;
