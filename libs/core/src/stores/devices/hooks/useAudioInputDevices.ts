import type { Device } from '@vonage/client-sdk-video';
import devicesStore from '../devicesStore';

const isAudioInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'audioinput';

const useAudioInputDevices = devicesStore.createSelectorHook(
  (state) => state.devices.filter(isAudioInputDevice),
  {
    isEqualRoot: (prev, next) => prev.devices === next.devices,
  }
);

export default useAudioInputDevices;
