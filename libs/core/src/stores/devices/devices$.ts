import store from './devicesStore';
import {
  useAudioInputDevices,
  useAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,
} from './hooks';

const devices$ = Object.assign(store, {
  useAudioInputDevices,
  useAudioOutput,
  useAudioOutputDevices,
  useVideoInputDevices,
  useConnectedDeviceId,
});

export default devices$;
