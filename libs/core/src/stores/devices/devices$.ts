import store from './devicesStore';
import {
  useAudioInputDevices,
  useAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,
} from './hooks';

import { devicesMap$ } from './observables';

const devices$ = Object.assign(store, {
  // Hooks
  useAudioInputDevices,
  useAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,

  // Observables
  devicesMap$,
});

export default devices$;
