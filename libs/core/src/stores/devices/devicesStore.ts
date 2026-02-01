import { createGlobalState, type InferAPI } from 'react-global-state-hooks';
import { assertDevicesStoreState } from './schemas/DevicesStoreState.schema';
import { setupDeviceStore, setAudioOutputDevice, setMediaDevice } from './actions';
import { initialValue, metadata } from './constants';

export type DevicesAPI = InferAPI<typeof devicesStore>;

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
      assertDevicesStoreState(restored);
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
      return setupDeviceStore(api);
    },
  },
});

export default devicesStore;
