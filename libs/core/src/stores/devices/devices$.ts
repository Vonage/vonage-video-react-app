import store from './devicesStore';

import {
  useAudioInputDevices,
  useSelectedAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,
  useSelectedAudioInput,
  useSelectedVideoInput,
  useAudioOutput, // legacy alias
} from './hooks';

import { devicesMap$ } from './observables';

const devices$ = Object.assign(store, {
  // Hooks
  useAudioInputDevices,
  useSelectedAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,
  useSelectedAudioInput,
  useSelectedVideoInput,
  // Legacy alias
  useAudioOutput,

  // Observables
  devicesMap$,
});

export default devices$;
