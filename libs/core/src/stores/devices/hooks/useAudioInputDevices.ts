import type { Device } from '@vonage/client-sdk-video';
import devices$ from '../DevicesStore';

const isAudioInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'audioinput';

const useAudioInputDevices = devices$.createSelectorHook(
  (state) => state.devices.filter(isAudioInputDevice),
  {
    isEqualRoot: (prev, next) => prev.devices === next.devices,
  }
);

export default useAudioInputDevices;
