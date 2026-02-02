import store from './devicesStore';

import {
  useAudioInputDevices,
  useSelectedAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useDevices,
  useSelectedAudioInput,
  useSelectedVideoInput,
  useAudioOutput,
} from './hooks';

import { mediaDeviceInfoByKind$ } from './observables';

const devices$ = Object.assign(store, {
  // Hooks
  useAudioInputDevices,
  useSelectedAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useDevices,
  useSelectedAudioInput,
  useSelectedVideoInput,
  useAudioOutput,

  // Observables
  mediaDeviceInfoByKind$,
});

export default devices$;
