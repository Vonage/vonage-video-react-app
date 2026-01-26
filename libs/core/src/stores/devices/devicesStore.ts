import createGlobalState, { type InferStateApi } from 'react-global-state-hooks/createGlobalState';
import { assertDevicesStore } from './schemas/DevicesStore.schema';

import {
  setupDeviceStore,
  setAudioOutputDevice,
  setMediaDevice,
  syncDevicesList,
  syncAudioOutputDevicesList,
  syncMediaDevicesList,
} from './actions';

import { initialValue, metadata } from './constants';

const internalActions = {
  syncDevicesList,
  syncAudioOutputDevicesList,
  syncMediaDevicesList,
};

/**
 * Devices store:
 * - devices: all media devices
 * - audioOutputDevices: all audio output devices
 * - audioOutput: selected audio output device
 *
 * Associated hooks:
 * - useAudioInputDevices: get all audio input devices
 * - useVideoInputDevices: get all video input devices
 * - useAudioOutputDevices: get all audio output devices
 * - useConnectedDeviceId: get the currently connected device id for a given kind, uses suspense
 */
const devicesStore = createGlobalState(initialValue, {
  metadata,
  actions: {
    /**
     * Sets the audio output device by its device ID. Throws if the deviceId does not exist.
     */
    setAudioOutputDevice,
    setMediaDevice,
  },
  localStorage: {
    key: 'vera-devices-store',
    validator: ({ restored }) => {
      assertDevicesStore(restored);
    },
    selector: ({ selectedAudioInput, selectedAudioOutput, selectedVideoInput }) => {
      return {
        selectedAudioInput,
        selectedAudioOutput,
        selectedVideoInput,
      };
    },
  },
  callbacks: {
    onInit: (api) => {
      // Extend actions type to include internal actions
      // This avoids polluting the public API with internal actions
      api.actions = Object.assign(api.actions, internalActions);

      return setupDeviceStore(api);
    },
  },
});

export type DevicesApi = InferStateApi<typeof devicesStore>;

export type DevicesApiPrivate = DevicesApi & {
  actions: typeof internalActions;
};

export default devicesStore;
