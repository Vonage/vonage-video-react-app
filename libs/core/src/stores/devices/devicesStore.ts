import createGlobalState, { type InferStateApi } from 'react-global-state-hooks/createGlobalState';
import syncDevicesList from './actions/syncDevicesList';
import syncAudioOutputDevicesList from './actions/syncAudioOutputDevicesList';
import syncMediaDevicesList from './actions/syncMediaDevicesList';
import { assertDevicesStore } from './schemas/DevicesStore.schema';
import setAudioOutputDevice from './actions/setAudioOutputDevice';
import setupDeviceStore from './actions/setupDeviceStore';
import initialValue from './constants/initialValue';
import metadata from './constants/metadata';

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
    syncDevicesList,
    syncAudioOutputDevicesList,
    syncMediaDevicesList,
    setAudioOutputDevice,
  },
  localStorage: {
    key: 'vera-devices-store',
    validator: ({ restored, initial }) => {
      assertDevicesStore(restored);

      metadata.restoredAudioOutput = restored.selectedAudioOutput;
      metadata.restoredAudioInput = restored.selectedAudioInput;
      metadata.restoredVideoInput = restored.selectedVideoInput;

      // prevents restoring until checking if the device is available
      return initial;
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
    onInit: setupDeviceStore,
  },
});

export type DevicesApi = InferStateApi<typeof devicesStore>;

export default devicesStore;
